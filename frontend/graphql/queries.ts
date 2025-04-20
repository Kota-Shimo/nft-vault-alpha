/* frontend/graphql/queries.ts */
import { gql } from '@apollo/client';

/* ───────── ダッシュボード ───────── */
export const GET_TOTAL_BALANCE = gql`
  query GetTotalBalance {
    totalBalanceJpy
  }
`;

/* ───────── NFT 一覧 ───────── */
export const GET_MY_NFTS = gql`
  query MyNfts($chainType: String) {
    myNfts(chainType: $chainType) {
      id
      title
      owner { id }
      isForSale
      price
    }
  }
`;

/* ───────── 仕訳一覧 ───────── */
export const GET_JOURNAL = gql`
  query GetJournal($tenantId: String!) {
    journal(tenantId: $tenantId) {
      id
      accountDr
      accountCr
      amountJpy         # freeeDealId など余計な項目は削除
    }
  }
`;

/* ───────── CSV 出力 ───────── */
export const GET_JOURNAL_CSV = gql`
  query GetJournalCsv($tenantId: String!) {
    journalCsv(tenantId: $tenantId)
  }
`;
