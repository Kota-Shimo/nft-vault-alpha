import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class JournalService {
  constructor(private prisma: PrismaService) {}

  /* 1) 取引→仕訳を生成 */
  async generateForTenant(tenantId: string): Promise<void> {
    const txs = await this.prisma.tx.findMany({ where: { tenantId } });

    for (const tx of txs) {
      const exists = await this.prisma.journal.findUnique({
        where: { txId: tx.id },
      });
      if (exists) continue;

      const account =
        tx.txType === 'GAS'
          ? { dr: '旅費交通費', cr: '現預金' }
          : { dr: '現預金', cr: '売上高' };

      await this.prisma.journal.create({
        data: {
          txId:      tx.id,
          accountDr: account.dr,
          accountCr: account.cr,
          amountJpy: tx.amountJpy,
        },
      });
    }
  }

  /* 2) 仕訳一覧 */
  async list(tenantId: string) {
    return this.prisma.journal.findMany({
      where: {
        tx: {
          tenantId,
          proof: null,             // ← 未転送 (= Proof 未作成) だけ取る
        },
      },
      include: { tx: true },       // ← 後段で j.tx.createdAt を使うため
      orderBy: { id: 'desc' },
    });
  }

  /* 3) CSV(base64) を返す */
  async exportCsv(tenantId: string): Promise<string> {
    const list = await this.list(tenantId);

    const rows = list.map(
      (j) =>
        `"${j.accountDr}","${j.accountCr}",${j.amountJpy},` +
        `${j.tx.createdAt.toISOString().slice(0, 10)}\n`,
    );
    const csv = '借方,貸方,金額,取引日\n' + rows.join('');

    return Buffer.from(csv).toString('base64');
  }
}
