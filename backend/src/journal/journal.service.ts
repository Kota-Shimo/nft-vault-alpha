import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

/**
 * JournalService
 * 取引（Tx）を仕訳（Journal）へ変換し管理するサービス
 */
@Injectable()
export class JournalService {
  constructor(private prisma: PrismaService) {}

  /* ------------------------------------------------------------------
   * 1) 取引 → 仕訳を生成
   *    - 既に仕訳がある Tx は除外
   *    - 簡易ルールで借方／貸方を決定
   *        RECEIVE : Cash / Sales
   *        SEND    : Expense / Cash
   *        GAS     : Expense / Cash（ガス手数料）
   * ----------------------------------------------------------------- */
  async generateForTenant(tenantId: string): Promise<number> {
    // 未仕訳の Tx 一覧を取得
    const txs = await this.prisma.tx.findMany({
      where: {
        tenantId,
        journal: { is: null },   // ★ 修正：Journal 未存在の Tx
      },
      orderBy: { blockNumber: 'asc' },
    });

    if (txs.length === 0) return 0;

    // 取引ごとに仕訳データを作成
    const data = txs.map((tx) => {
      switch (tx.txType) {
        case 'RECEIVE':
          return {
            txId: tx.id,
            accountDr: 'Cash',
            accountCr: 'Sales',
            amountJpy: tx.amountJpy,
          };

        case 'SEND':
        case 'GAS':
        default:
          return {
            txId: tx.id,
            accountDr: 'Expense',
            accountCr: 'Cash',
            amountJpy: tx.amountJpy,
          };
      }
    });

    // createMany で一括 INSERT
    await this.prisma.journal.createMany({ data });
    return data.length; // 生成件数
  }

  /* ------------------------------------------------------------------
   * 2) 仕訳一覧取得
   * ----------------------------------------------------------------- */
  async list(tenantId: string) {
    return this.prisma.journal.findMany({
      where: { tx: { tenantId } },
      include: { tx: true },
      orderBy: { id: 'desc' },
    });
  }

  /* ------------------------------------------------------------------
   * 3) 仕訳を CSV(Base64) でエクスポート
   * ----------------------------------------------------------------- */
  async exportCsv(tenantId: string): Promise<string> {
    const list = await this.list(tenantId);

    const header = '借方,貸方,金額,取引日\n';
    const rows = list
      .map(
        (j) =>
          `"${j.accountDr}","${j.accountCr}",${j.amountJpy},` +
          `${j.tx.createdAt.toISOString().slice(0, 10)}`,
      )
      .join('\n');

    return Buffer.from(header + rows + '\n', 'utf8').toString('base64');
  }
}
