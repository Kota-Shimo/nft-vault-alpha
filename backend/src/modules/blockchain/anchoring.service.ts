import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from '@nestjs/schedule';
import { ethers } from "ethers";
import { keccak256 } from "ethers/lib/utils";
import { PrismaService } from "../../prisma.service";

@Injectable()
export class AnchoringService {
  private provider: ethers.providers.JsonRpcProvider;
  private contract: ethers.Contract;

  constructor(private prisma: PrismaService) {
    // Ethereumノード接続（.envから）
    this.provider = new ethers.providers.JsonRpcProvider(process.env.EVM_RPC_URL);

    const abi = [
      "function anchorData(bytes32 merkleRoot) external"
    ];

    const wallet = new ethers.Wallet(process.env.EVM_PRIVATE_KEY!, this.provider);

    // Anchorコントラクト初期化（.envからアドレス指定）
    this.contract = new ethers.Contract(
      process.env.EVM_ANCHOR_CONTRACT_ADDRESS!,
      abi,
      wallet
    );
  }

  // ✅ 10分ごとに未アンカリングのTxをまとめて処理
  @Cron(CronExpression.EVERY_10_MINUTES)
  async anchorTransactions() {
    const txs = await this.prisma.transaction.findMany({
      where: { ethAnchorHash: null },
    });

    if (txs.length === 0) {
      console.log("🔁 アンカリング対象なし");
      return;
    }

    for (const tx of txs) {
      try {
        const hash = keccak256(Buffer.from(tx.id));
        const txResult = await this.contract.anchorData(hash);
        const receipt = await txResult.wait();

        await this.prisma.transaction.update({
          where: { id: tx.id },
          data: { ethAnchorHash: receipt.transactionHash },
        });

        console.log(`✅ Anchored Tx ID: ${tx.id}, Hash: ${receipt.transactionHash}`);
      } catch (error) {
        console.error(`❌ Anchor failed for Tx ID: ${tx.id}`, error);
      }
    }
  }
}
