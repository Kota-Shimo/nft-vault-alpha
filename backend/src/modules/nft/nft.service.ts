import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";
import { MintNftInput, ListForSaleInput, BuyNftInput } from "./dto/nft.dto";
import { FileService } from "../file/file.service";
import { AptosService } from "../blockchain/aptos.service";

@Injectable()
export class NftService {
  constructor(
    private prisma: PrismaService,
    private fileService: FileService,
    private aptosService: AptosService
  ) {}

  async getMyNfts(userId: string, chainType?: string) {
    if (!userId) return [];
    return this.prisma.nftItem.findMany({
      where: {
        ownerId: userId,
        ...(chainType ? { chainType } : {}),
      },
      include: { owner: true },
    });
  }

  async getMarketNfts(chainType?: string) {
    return this.prisma.nftItem.findMany({
      where: {
        isForSale: true,
        ...(chainType ? { chainType } : {}),
      },
      include: { owner: true },
    });
  }

  async mintNft(input: MintNftInput, userId: string) {
    try {
      console.log("🟢 mintNft開始:", { input, userId });

      const celestiaHash = await this.fileService.uploadToCelestia(input.imageBase64);
      console.log("📦 Celestia hash:", celestiaHash);

      const txHash = await this.aptosService.mintNftOnAptos({
        title: input.title,
        description: input.description,
        metadataHash: celestiaHash,
      });
      console.log("🔁 Aptos TxHash:", txHash);

      const nft = await this.prisma.nftItem.create({
        data: {
          chainType: "APTOS",
          metadataHash: celestiaHash,
          title: input.title,
          description: input.description,
          ownerId: userId,
          transactions: {
            create: {
              userId,
              moveTxHash: txHash,
              type: "MINT",
            },
          },
        },
        include: { owner: true },
      });

      console.log("✅ Mint 成功:", nft);
      return nft;
    } catch (error) {
      console.error("❌ mintNft内でエラー:", error);
      throw error;
    }
  }

  async listForSale(input: ListForSaleInput, userId: string) {
    return this.prisma.nftItem.update({
      where: { id: input.nftId },
      data: {
        isForSale: true,
        price: input.price,
      },
      include: { owner: true },
    });
  }

  async buyNft(input: BuyNftInput, buyerId: string) {
    return this.prisma.nftItem.update({
      where: { id: input.nftId },
      data: {
        ownerId: buyerId,
        isForSale: false,
        price: null,
        transactions: {
          create: {
            userId: buyerId,
            moveTxHash: "0xDUMMY_BUY_HASH", // 将来的に本物に置換
            type: "BUY",
          },
        },
      },
      include: { owner: true },
    });
  }
}
