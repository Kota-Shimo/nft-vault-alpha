import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileService {
  /**
   * Data URL またはローカルファイルパスを Celestia にアップロードし、
   * 生成された tx_hash（または height）を返す
   */
  async uploadToCelestia(src: string): Promise<string> {
    try {
      /* ---------- 1. 画像データを Buffer で取得 ---------- */
      const buf = this.toBuffer(src);

      /* ---------- 2. 29‑byte Namespace を生成 ---------- */
      const userHex = process.env.CELESTIA_NAMESPACE_ID ?? '';
      if (!/^[0-9a-fA-F]{20}$/.test(userHex)) {
        throw new Error(
          'CELESTIA_NAMESPACE_ID must be 20‑hex characters (10 bytes)',
        );
      }
      const namespaceBytes = Buffer.concat([
        Buffer.from([0x00]),           // version = 0
        Buffer.alloc(18, 0),           // 18byte zero‑padding
        Buffer.from(userHex, 'hex'),   // user part 10byte
      ]);
      const namespaceB64 = namespaceBytes.toString('base64');

      /* ---------- 3. JSON‑RPC ペイロード ---------- */
      const payload = {
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'blob.Submit',
        params: [
          [
            {
              namespace: namespaceB64,
              data: buf.toString('base64'),
              share_version: 0,
            },
          ],
          {
            gas_limit: 120_000,
            fee: 2_000,
            memo: 'mint‑nft',
          },
        ],
      };

      /* ---------- 4. ヘッダー ---------- */
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (process.env.CELESTIA_RPC_AUTH_TOKEN) {
        headers.Authorization = `Bearer ${process.env.CELESTIA_RPC_AUTH_TOKEN}`;
      }

      /* ---------- 5. RPC 送信 ---------- */
      const { data } = await axios.post(
        process.env.CELESTIA_RPC_URL as string,
        payload,
        { headers },
      );

      /* ---------- 6. 戻り値のパターンごとに成功扱い ---------- */
      if (typeof data?.result === 'string' && data.result.startsWith('0x')) {
        // 旧仕様: tx_hash 直接
        return data.result;
      }
      if (typeof data?.result?.tx_hash === 'string') {
        // 中間バージョン
        return data.result.tx_hash;
      }
      if (typeof data?.result === 'number') {
        // v0.22+ 新仕様: ブロック高のみ返る
        return `height:${data.result}`;
      }

      /* ---------- 7. 予期しない形式はエラー ---------- */
      throw new Error(JSON.stringify(data));
    } catch (err) {
      throw new InternalServerErrorException(
        `Celestia upload failed: ${(err as Error).message}`,
      );
    }
  }

  /** Data URL かローカルパスかを判定し、Buffer を返す */
  private toBuffer(src: string): Buffer {
    if (src.startsWith('data:')) {
      return Buffer.from(src.split(',')[1], 'base64');
    }
    const abs = path.isAbsolute(src) ? src : path.resolve(src);
    return fs.readFileSync(abs);
  }
}
