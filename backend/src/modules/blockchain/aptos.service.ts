import { Injectable } from "@nestjs/common";
import { AptosClient } from "aptos";
import { AggregatedNft } from "./nft.types"; // 型定義を使う（自作ファイル）

@Injectable()
export class AptosService {
  private client: AptosClient;

  constructor() {
    this.client = new AptosClient("https://fullnode.testnet.aptoslabs.com/v1");
  }

  async mintNftOnAptos(params: { title: string; description: string; metadataHash: string }): Promise<string> {
    // 本来はPetraとの署名やリクエスト送信を行う
    return "0xDUMMY_APTOS_TX_HASH";
  }

  async fetchNftsByAddress(address: string): Promise<AggregatedNft[]> {
    // 将来的にAptosから本物のNFT一覧を取得する処理を入れる
    return [
      {
        id: "dummy-aptos-nft-1",
        metadataHash: "celestia://abc123",
        title: "Aptos NFT Sample",
      },
    ];
  }
}
