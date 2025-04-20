import { gql } from "@apollo/client";

export const CONNECT_WALLET = gql`
  mutation ConnectWallet($input: WalletConnectInput!) {
    connectWallet(input: $input) {
      token
      user {
        id
        walletAddresses
      }
    }
  }
`;

export const MINT_NFT = gql`
  mutation MintNft($input: MintNftInput!) {
    mintNft(input: $input) {
      id
      title
      owner {
        id
      }
    }
  }
`;

export const LIST_FOR_SALE = gql`
  mutation ListForSale($input: ListForSaleInput!) {
    listForSale(input: $input) {
      id
      isForSale
      price
    }
  }
`;

export const BUY_NFT = gql`
  mutation BuyNft($input: BuyNftInput!) {
    buyNft(input: $input) {
      id
      owner {
        id
      }
      isForSale
    }
  }
`;
