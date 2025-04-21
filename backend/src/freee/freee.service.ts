/* backend/src/freee/freee.service.ts
   ────────────────────────────────── */
import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import { PrismaService } from '../prisma.service';

/* 取引 POST 用の最小 DTO */
export interface PostDealInput {
  accountCrId: number; // 貸方 freee 科目 ID
  taxCodeId: number;   // 税区分 ID (例: 108 = 外税10%)
  amountJpy: number;
  txDate: string;      // YYYY‑MM‑DD
}

@Injectable()
export class FreeeService {
  private readonly log = new Logger(FreeeService.name);

  constructor(private prisma: PrismaService) {}

  /* ───────────── freee HTTP クライアント ───────────── */
  private readonly api = axios.create({
    baseURL: 'https://api.freee.co.jp/api/1',
    headers: {
      Authorization: `Bearer ${process.env.FREEE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  /**
   * 入力 1 件 → freee /deals へ POST
   * FREEE_ENABLED=false の場合は -1 を返す
   */
  async postDeal(j: PostDealInput): Promise<number> {
    if (process.env.FREEE_ENABLED === 'false') {
      this.log.warn('FREEE_ENABLED=false → 送信スキップ');
      return -1; // ダミー ID
    }

    const body = {
      company_id: Number(process.env.FREEE_COMPANY_ID),
      issue_date: j.txDate,
      due_date: j.txDate,
      type: 'income',
      details: [
        {
          account_item_id: j.accountCrId,
          tax_code: j.taxCodeId,
          amount: j.amountJpy,
        },
      ],
      payments: [
        {
          date: j.txDate,
          amount: j.amountJpy,
          from_walletable_type: 'bank_account',
          from_walletable_id: Number(process.env.FREEE_BANK_ID),
        },
      ],
    };

    try {
      const { data } = await this.api.post('/deals', body);
      const id = data.deal?.id as number;
      this.log.log(`✅ posted deal ${id}`);
      return id;
    } catch (err) {
      /* freee エラーメッセージを抽出して投げ直し */
      const e = err as AxiosError<any>;
      this.log.error('freee POST /deals error');
      this.log.error(JSON.stringify(e.response?.data ?? e, null, 2));

      const msg =
        e.response?.data?.errors
          ?.flatMap((x: any) => x.messages)
          .join(', ') ?? e.message;
      throw new Error(`freee API error: ${msg}`);
    }
  }

  /* ────────────────────────────────────────────────
   * 指定テナントの 未送信(=freeeDealId NULL) Journal を
   * まとめて freee に送り、dealId を保存
   * 戻り値: 成功した件数
   * ─────────────────────────────────────────────── */
  async sendJournals(tenantId: string): Promise<number> {
    const journals = await this.prisma.journal.findMany({
      where: {
        tx: { tenantId },
        freeeDealId: null,
      },
      include: { tx: true },
    });

    if (!journals.length) return 0;

    const idSales = Number(process.env.FREEE_ACCOUNT_ITEM_SALES ?? 12);
    const idExpense = Number(process.env.FREEE_ACCOUNT_ITEM_EXPENSE ?? 79);

    let success = 0;

    for (const j of journals) {
      const isIncome = j.accountDr === 'Cash'; // Cash / Sales = income
      const accountId = isIncome ? idSales : idExpense;

      const dealId = await this.postDeal({
        accountCrId: accountId,
        taxCodeId: 108, // 外税10%
        amountJpy: j.amountJpy,
        txDate: j.tx.createdAt.toISOString().slice(0, 10),
      });

      /* スキップ (-1) でなければ DB へ保存 */
      if (dealId !== -1) {
        await this.prisma.journal.update({
          where: { id: j.id },
          data: { freeeDealId: dealId },
        });
      }
      success += 1;
    }

    return success;
  }

  /* ───────── GraphQL からの “テスト送信” ラッパー ─────────
     今後は GraphQL 直接呼び出しは sendJournals を使う */
  async sendJournal(_tenantId: string): Promise<boolean> {
    await this.postDeal({
      accountCrId: Number(process.env.FREEE_ACCOUNT_ITEM_SALES ?? 12),
      taxCodeId: 108,
      amountJpy: 1,
      txDate: new Date().toISOString().slice(0, 10),
    });
    return true;
  }
}
