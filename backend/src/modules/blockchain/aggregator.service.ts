import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from '@nestjs/schedule';
import { EvmService } from "./evm.service";
import { AptosService } from "./aptos.service";
import { PrismaService } from "../../prisma.service";

@Injectable()
export class AggregatorService {
  constructor(
    private evmService: EvmService,
    private aptosService: AptosService,
    private prisma: PrismaService
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES) // ✅ ← 5分ごとに実行
  async syncAllNfts() {
    const users = await this.prisma.user.findMany();
    for (const user of users) {
      for (const address of user.walletAddresses) {
        const evmNfts = await this.evmService.fetchNftsByAddress(address);
        const aptosNfts = await this.aptosService.fetchNftsByAddress(address);

        console.log(`User ${user.id} NFTs`, { evmNfts, aptosNfts });

        // ✅ EVMのNFTをDBに保存
        for (const nft of evmNfts) {
          await this.prisma.nftItem.upsert({
            where: { id: nft.id },
            update: {
              ownerId: user.id,
              chainType: "EVM",
              metadataHash: nft.metadataHash,
            },
            create: {
              id: nft.id,
              ownerId: user.id,
              chainType: "EVM",
              metadataHash: nft.metadataHash,
              title: nft.title || null,
            },
          });
        }

        // ✅ AptosのNFTをDBに保存
        for (const nft of aptosNfts) {
          await this.prisma.nftItem.upsert({
            where: { id: nft.id },
            update: {
              ownerId: user.id,
              chainType: "APTOS",
              metadataHash: nft.metadataHash,
            },
            create: {
              id: nft.id,
              ownerId: user.id,
              chainType: "APTOS",
              metadataHash: nft.metadataHash,
              title: nft.title || null,
            },
          });
        }
      }
    }
  }
}
