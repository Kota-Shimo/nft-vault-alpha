/* backend/src/freee/freee.service.ts
   ────────────────────────────────── */
   import { Injectable, Logger } from '@nestjs/common';
   import axios, { AxiosError }  from 'axios';
   
   export interface PostDealInput {
     accountDr   : string;  // 借方科目名（今回は未使用）
     accountCrId : number;  // 貸方 freee 科目 ID
     taxCodeId   : number;  // 税区分 ID（外税売上 10% = 108 など）
     amountJpy   : number;
     txDate      : string;  // YYYY‑MM‑DD
   }
   
   @Injectable()
   export class FreeeService {
     private readonly logger = new Logger(FreeeService.name);
   
     /* ───────────── freee HTTP クライアント ───────────── */
     private readonly api = axios.create({
       baseURL: 'https://api.freee.co.jp/api/1',
       headers: {
         Authorization : `Bearer ${process.env.FREEE_ACCESS_TOKEN}`,
         'Content-Type': 'application/json',
       },
     });
   
     /**
      * freee へ「取引」を 1 件登録し dealId を返す  
      * FREEE_ENABLED=false のときは実際には送信せず、‐1 を返す
      */
     async postDeal(j: PostDealInput): Promise<number> {
       /* ── ❶ 送信スキップモード ─────────────────────── */
       if (process.env.FREEE_ENABLED === 'false') {
         this.logger.warn('⚠ FREEE_ENABLED=false なので送信をスキップしました');
         return -1;   // ダミー ID
       }
   
       /* ── ❷ freee 送信ボディ ───────────────────────── */
       const body = {
         company_id : Number(process.env.FREEE_COMPANY_ID),
         issue_date : j.txDate,
         due_date   : j.txDate,
         type       : 'income',
         details    : [
           {
             account_item_id: j.accountCrId,
             tax_code       : j.taxCodeId,
             amount         : j.amountJpy,
           },
         ],
         payments: [
           {
             date                : j.txDate,
             amount              : j.amountJpy,
             from_walletable_type: 'bank_account',
             from_walletable_id  : Number(process.env.FREEE_BANK_ID),
           },
         ],
       };
   
       /* ── ❸ POST /deals ─────────────────────────────── */
       try {
         const { data } = await this.api.post('/deals', body);
         const id = data.deal?.id as number;
         this.logger.log(`✅ posted deal ${id}`);
         return id;
       } catch (err) {
         /* freee エラーメッセージを抽出して投げ直し */
         const e = err as AxiosError<any>;
         this.logger.error('freee POST /deals error');
         this.logger.error(JSON.stringify(e.response?.data ?? e, null, 2));
   
         const msg =
           e.response?.data?.errors?.flatMap((x: any) => x.messages).join(', ') ??
           e.message;
         throw new Error(`freee API error: ${msg}`);
       }
     }
   
     /* ────────────────────────────────────────────────
      *  GraphQL から使用する “テスト送信” ラッパー
      *  (現状は固定値 1 件を送信して true を返す)
      * ─────────────────────────────────────────────── */
     async sendJournal(_tenantId: string): Promise<boolean> {
       await this.postDeal({
         accountDr   : '現預金',
         accountCrId : Number(process.env.FREEE_ACCOUNT_ITEM_SALES ?? 79),
         taxCodeId   : 108,               // 外税売上 10 %
         amountJpy   : 1,
         txDate      : new Date().toISOString().slice(0, 10),
       });
       return true;
     }
   }
   