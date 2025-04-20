/* backend/src/sync/sync.service.ts
   ───────────────────────────────
   - RPC タイムアウトを 90 秒に延長
   - 取得ブロック幅を 3 へ縮小（＝RPC 1 呼び出しあたりの負荷軽減）
*/

import { Injectable, Logger } from '@nestjs/common';
import { Cron }               from '@nestjs/schedule';
import { PrismaService }      from '../prisma.service';
import { ethers }             from 'ethers';
import axios                  from 'axios';
import { BlockWithTransactions } from '@ethersproject/abstract-provider';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  /** Alchemy RPC（90 s タイムアウト付き） */
  private readonly provider = new ethers.providers.JsonRpcProvider(
    {
      url:     process.env.EVM_RPC_URL!, // 例: https://eth-mainnet.g.alchemy.com/v2/xxx
      timeout: 90_000,                   // 90 秒
    },
    { name: 'mainnet', chainId: 1 },
  );

  private isRunning = false;
  private rateCache: Record<string, number> = {};

  constructor(private readonly prisma: PrismaService) {}

  /** 1 分おきにブロック／レート同期 */
  @Cron('* * * * *')
  async handleCron(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('⏳ 前回実行中、スキップ');
      return;
    }
    this.isRunning = true;

    try {
      /* 1. 登録ウォレット一覧を取得（アドレス小文字化） */
      const addrs = new Set(
        (await this.prisma.wallet.findMany({ select: { address: true } }))
          .map(w => w.address.toLowerCase()),
      );
      if (!addrs.size) {
        this.logger.warn('⚠ ウォレット未登録のため同期スキップ');
        return;
      }

      /* 2. 同期対象ブロック範囲を決定 */
      const latest = await this.provider.getBlockNumber();
      const last =
        (
          await this.prisma.tx.aggregate({
            _max: { blockNumber: true },
          })
        )._max?.blockNumber ?? latest - 25;

      if (latest === last) {
        this.logger.log('💤 新規ブロックなし');
        return;
      }

      /* 3. 3 ブロックずつ取得して保存 */
      for (let from = last + 1; from <= latest; from += 3) {
        const to = Math.min(from + 2, latest);

        const blocks: BlockWithTransactions[] = await Promise.all(
          [...Array(to - from + 1).keys()].map(i =>
            this.provider.getBlockWithTransactions(from + i),
          ),
        );

        for (const b of blocks) {
          const dateKey = new Date(b.timestamp * 1e3)
            .toISOString()
            .slice(0, 10);                     // YYYY-MM-DD
          const rateJpy = await this.getRate(dateKey);

          for (const tx of b.transactions) {
            const fromAddr = tx.from.toLowerCase();
            const toAddr   = (tx.to ?? '').toLowerCase();
            const isSend   = addrs.has(fromAddr);
            const isRecv   = addrs.has(toAddr);
            if (!isSend && !isRecv) continue; // 自社アドレス無関係

            await this.prisma.tx.upsert({
              where:  { hash: tx.hash },
              create: {
                hash:        tx.hash,
                blockNumber: b.number,
                rateJpy,
                amountJpy:
                  (isRecv ? 1 : -1) *
                  Number(ethers.utils.formatEther(tx.value)) *
                  rateJpy,
                txType: isSend ? 'SEND' : 'RECEIVE',
              },
              update: {},                      // 既存は触らない
            });
          }
        }
        this.logger.log(`sync ${from}-${to}`);
      }

      this.logger.log(`✅ synced to ${latest}`);
    } catch (e) {
      this.logger.error('sync error', e as Error);
    } finally {
      this.isRunning = false;
    }
  }

  /** 1 日単位の ETH→JPY レートをキャッシュ取得 */
  private async getRate(date: string): Promise<number> {
    if (this.rateCache[date]) return this.rateCache[date];

    const [yyyy, mm, dd] = date.split('-');
    const { data } = await axios.get(
      'https://api.coingecko.com/api/v3/coins/ethereum/history',
      { params: { date: `${dd}-${mm}-${yyyy}` } },
    );
    const rate = data.market_data.current_price.jpy as number;
    this.rateCache[date] = rate;
    return rate;
  }
}
