/* backend/src/journal/journal.sync.ts
   ─────────────────────────────────── */
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma.service';
import { FreeeService } from '../freee/freee.service';

@Injectable()
export class JournalSyncJob {
  private readonly logger = new Logger(JournalSyncJob.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly freee: FreeeService,
  ) {}

  /** 10 分おきに未送信仕訳を freee へ転送 */
  @Cron('*/10 * * * *')
  async handle(): Promise<void> {
    /* freeeDealId が null のものを 50 件だけ取る */
    const unsent = await this.prisma.journal.findMany({
      where: { freeeDealId: null },
      include: { tx: true },
      take: 50,
    });
    if (!unsent.length) return;

    /* 借方／貸方→freee 勘定科目 ID 簡易マップ */
    const accountIdMap: Record<string, number> = {
      'Sales': Number(process.env.FREEE_ACCOUNT_ITEM_SALES ?? 12),
      'Expense': Number(process.env.FREEE_ACCOUNT_ITEM_EXPENSE ?? 79),
    };
    const TAX_CODE_SALES_10 = 108; // 外税売上 10%

    let success = 0;

    for (const j of unsent) {
      try {
        const accountCrId = accountIdMap[j.accountCr] ?? 0;

        const dealId = await this.freee.postDeal({
          accountCrId,
          taxCodeId: TAX_CODE_SALES_10,
          amountJpy: j.amountJpy,
          txDate: j.tx.createdAt.toISOString().slice(0, 10),
        });

        /* FREEE_ENABLED=false モードでは -1 で返る */
        if (dealId !== -1) {
          await this.prisma.journal.update({
            where: { id: j.id },
            data: { freeeDealId: dealId },
          });
        }
        success += 1;
      } catch (e) {
        this.logger.error(`❌ fail id=${j.id}`, e as Error);
      }
    }
    this.logger.log(`✅ sent ${success} journal(s)`);
  }
}
