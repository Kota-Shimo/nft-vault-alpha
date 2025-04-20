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
    private readonly freee : FreeeService,
  ) {}

  /** 10 分おきに未送信仕訳を freee へ転送 */
  @Cron('*/10 * * * *')
  async handle(): Promise<void> {
    const unsent = await this.prisma.journal.findMany({
      where  : { freeeDealId: null },
      include: { tx: true },
      take   : 50,
    });
    if (!unsent.length) return;

    /* 科目 → freee ID 簡易マップ */
    const accountIdMap: Record<string, number> = {
      '売上高'   : 79,
      '旅費交通費': 34,
    };
    const TAX_CODE_SALES_10 = 108;

    for (const j of unsent) {
      try {
        const dealId = await this.freee.postDeal({
          accountDr   : j.accountDr,
          accountCrId : accountIdMap[j.accountCr] ?? 0,
          taxCodeId   : TAX_CODE_SALES_10,
          amountJpy   : j.amountJpy,
          txDate      : j.tx.createdAt.toISOString().slice(0, 10),
        });

        await this.prisma.journal.update({
          where: { id: j.id },
          data : { freeeDealId: dealId },
        });
      } catch (e) {
        this.logger.error(`❌ fail id=${j.id}`, e as Error);
      }
    }
    this.logger.log(`✅ sent ${unsent.length} journal(s)`);
  }
}
