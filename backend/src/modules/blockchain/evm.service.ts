import { Injectable } from "@nestjs/common";
import { ethers } from "ethers";
import { AggregatedNft } from "./nft.types"; // 型定義を使う（自作ファイル）

@Injectable()
export class EvmService {
  private provider: ethers.providers.JsonRpcProvider;
  private contract: ethers.Contract;

  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(process.env.EVM_RPC_URL);
    const wallet = new ethers.Wallet(process.env.EVM_PRIVATE_KEY!, this.provider);

    const abi = [
      "function mint(address to, string memory tokenURI) public returns (uint256)"
    ];

    this.contract = new ethers.Contract(
      process.env.EVM_CONTRACT_ADDRESS!,
      abi,
      wallet
    );
  }

  async fetchNftsByAddress(address: string): Promise<AggregatedNft[]> {
    // 将来的にTheGraphやMoralisなどで取得
    return [
      {
        id: "dummy-evm-nft-1",
        metadataHash: "celestia://def456",
        title: "EVM NFT Sample",
      },
    ];
  }

  async mintNftOnEvm(params: { to: string; tokenUri: string }): Promise<string> {
    const { to, tokenUri } = params;

    const tx = await this.contract.mint(to, tokenUri);
    const receipt = await tx.wait();

    return receipt.transactionHash;
  }
}
