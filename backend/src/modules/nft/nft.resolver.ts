import { Resolver, Query, Mutation, Args, Context } from "@nestjs/graphql";
import {
  NftItem,
  MintNftInput,
  ListForSaleInput,
  BuyNftInput,
} from "./dto/nft.dto";
import { NftService } from "./nft.service";
import { EvmService } from "../blockchain/evm.service";          // ★ 追加

@Resolver()
export class NftResolver {
  constructor(
    private readonly nftService: NftService,
    private readonly evmService: EvmService,                    // ★ 追加
  ) {}

  /* ─────────────── 既存 Query ─────────────── */

  @Query(() => [NftItem])
  async myNfts(
    @Context() ctx: any,
    @Args("chainType", { nullable: true }) chainType?: string,
  ) {
    const userId = ctx.req.user?.id || null;
    return this.nftService.getMyNfts(userId, chainType);
  }

  @Query(() => [NftItem])
  async marketNfts(
    @Args("chainType", { nullable: true }) chainType?: string,
  ) {
    return this.nftService.getMarketNfts(chainType);
  }

  /* ─────────────── 既存 Mutation ─────────────── */

  @Mutation(() => NftItem)
  async mintNft(
    @Args("input") input: MintNftInput,
    @Context() ctx: any,
  ) {
    const userId = ctx.req.user?.id || "anonymous";
    return this.nftService.mintNft(input, userId);
  }

  @Mutation(() => NftItem)
  async listForSale(
    @Args("input") input: ListForSaleInput,
    @Context() ctx: any,
  ) {
    const userId = ctx.req.user?.id || "anonymous";
    return this.nftService.listForSale(input, userId);
  }

  @Mutation(() => NftItem)
  async buyNft(
    @Args("input") input: BuyNftInput,
    @Context() ctx: any,
  ) {
    const buyerId = ctx.req.user?.id || "anonymous";
    return this.nftService.buyNft(input, buyerId);
  }

  /* ─────────────── ★ 新規：EVM 専用 ─────────────── */

  /** 指定アドレスが保有する EVM NFT 一覧（現状ダミー返却） */
  @Query(() => [NftItem])
  evmNfts(@Args("owner") owner: string) {
    return this.evmService.fetchNftsByAddress(owner);
  }

  /** Solidity コントラクトで mint し、Tx ハッシュ文字列を返す */
  @Mutation(() => String)
  mintNftOnEvm(
    @Args("to") to: string,
    @Args("tokenUri") tokenUri: string,
  ) {
    return this.evmService.mintNftOnEvm({ to, tokenUri });
  }
}
