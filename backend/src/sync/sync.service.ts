/* backend/src/sync/sync.service.ts
   差分同期 & getLogs 高速化版
   - 1 テナントごとに lastSyncedBlock 差分取得
   - provider.getLogs + 1000‑block チャンク
   - ETH→JPY レートを日付キャッシュ
   - console.time で全体所要時間を計測
*/

import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma.service';
import { ethers } from 'ethers';
import axios from 'axios';
import chunk from 'lodash/chunk';

@Injectable()
export class SyncService {
  private readonly log = new Logger(SyncService.name);

  private provider = new ethers.providers.JsonRpcProvider(
    { url: process.env.EVM_RPC_URL!, timeout: 90_000 },
    { name: 'mainnet', chainId: 1 },
  );

  private rateCache: Record<string, number> = {};

  constructor(private prisma: PrismaService) {}

  /** 毎分実行 */
  @Cron('* * * * *')
  async handleCron() {
    console.time('sync');

    /* 1) 全テナントを取得（ウォレット付き） */
    const tenants = await this.prisma.tenant.findMany({
      include: { wallets: true },
    });
    if (!tenants.length) return;

    for (const t of tenants) {
      if (!t.wallets.length) continue;

      /* 2) 差分範囲計算 */
      const latest = await this.provider.getBlockNumber();
      const from   = t.lastSyncedBlock + 1;
      if (from > latest) continue;

      const addrSet = new Set(t.wallets.map(w => w.address.toLowerCase()));

      /* 3) 1000‑block ごとに getLogs → INSERT */
      const ranges = chunk(
        Array.from({ length: latest - from + 1 }, (_, i) => from + i),
        1000,
      ).map((arr: number[]) => [arr[0], arr[arr.length - 1]] as [number, number]);

      for (const [rFrom, rTo] of ranges) {
        const logs = await this.provider.getLogs({
          fromBlock: rFrom,
          toBlock:   rTo,
        });

        /* ブロック日付キャッシュ */
        const blockDate = new Map<number, string>();
        const getDate = async (bn: number) => {
          if (blockDate.has(bn)) return blockDate.get(bn)!;
          const b = await this.provider.getBlock(bn);
          const d = new Date(b.timestamp * 1e3).toISOString().slice(0, 10);
          blockDate.set(bn, d);
          return d;
        };

        const rows = [];
        for (const l of logs) {
          /* 送受いずれかが自社ウォレットなら対象 */
          if (!addrSet.has(l.address.toLowerCase())) continue;

          const date = await getDate(l.blockNumber);
          const rate = await this.rate(date);
          const eth  = Number(ethers.utils.formatEther(l.data || '0x0'));

          rows.push({
            hash: l.transactionHash,
            blockNumber: l.blockNumber,
            rateJpy: rate,
            amountJpy: eth * rate,
            txType: 'RECEIVE',
            tenantId: t.id,
          });
        }

        if (rows.length) {
          await this.prisma.tx.createMany({ data: rows, skipDuplicates: true });
        }
        this.log.log(`tenant=${t.id} ${rFrom}-${rTo} (${rows.length} tx)`);
      }

      /* 4) 差分同期位置を更新 */
      await this.prisma.tenant.update({
        where: { id: t.id },
        data:  { lastSyncedBlock: latest },
      });
      this.log.log(`tenant=${t.id} synced → ${latest}`);
    }

    console.timeEnd('sync');
  }

  /* ETH→JPY レートを日付キャッシュ取得 */
  private async rate(date: string) {
    if (this.rateCache[date]) return this.rateCache[date];

    const [y, m, d] = date.split('-');
    const { data } = await axios.get(
      'https://api.coingecko.com/api/v3/coins/ethereum/history',
      { params: { date: `${d}-${m}-${y}` } },
    );
    return (this.rateCache[date] =
      data.market_data.current_price.jpy as number);
  }
}
