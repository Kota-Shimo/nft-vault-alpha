import { Module } from "@nestjs/common";
import { NftResolver } from "./nft.resolver";
import { NftService } from "./nft.service";
import { PrismaService } from "../../prisma.service";
import { FileService } from "../file/file.service";
import { AptosService } from "../blockchain/aptos.service";
import { EvmService } from "../blockchain/evm.service"; // ✅ 追加

@Module({
  providers: [
    NftResolver,
    NftService,
    PrismaService,
    FileService,
    AptosService,
    EvmService // ✅ ここで登録
  ],
})
export class NftModule {}
