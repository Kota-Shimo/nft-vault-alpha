import { gql } from '@apollo/client';

/* ───────── ダッシュボード ───────── */
export const GET_TOTAL_BALANCE = gql`
  query {
    totalBalanceJpy
  }
`;

/* ───────── NFT 一覧 ───────── */
export const GET_MY_NFTS = gql`
  query ($chainType: String) {
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
  query {
    journal {
      id
      accountDr
      accountCr
      amountJpy
      freeeDealId
    }
  }
`;

/* ───────── CSV 出力 ───────── */
export const GET_JOURNAL_CSV = gql`
  query {
    journalCsv
  }
`;

/* ───────── 仕訳生成 ───────── */
export const MUTATE_GENERATE = gql`
  mutation {
    generateJournal
  }
`;

/* ───────── freee 送信 ───────── */
export const MUTATE_FREEE = gql`
  mutation {
    sendJournalToFreee
  }
`;

/* ───────── Proof 一覧 ───────── */
export const GET_PROOFS = gql`
  query {
    proofs {
      id
      txId
      pdfUrl
      celestiaHash
    }
  }
`;

/* ───────── Stripe Checkout ───────── */
export const CREATE_CHECKOUT = gql`
  mutation ($plan: String!) {
    createCheckout(plan: $plan)
  }
`;
