/* frontend/pages/dashboard/index.tsx */
import React from "react";
import { useQuery } from "@apollo/client";
import { GET_MY_NFTS, GET_TOTAL_BALANCE } from "../../graphql/queries";
import {
  Box,
  Button,
  SimpleGrid,
  Text,
  Stat,
  StatLabel,
  StatNumber,
} from "@chakra-ui/react";
import { useRouter } from "next/router";

export default function Dashboard() {
  const router = useRouter();

  /* ① 総残高 (JPY) ─ 5分ごとに更新 */
  const { data: balData } = useQuery(GET_TOTAL_BALANCE, {
    pollInterval: 300_000,
  });
  const balance = balData?.totalBalanceJpy ?? 0;        // ★ ここを修正

  /* ② NFT 一覧 */
  const {
    data: nftData,
    loading: nftLoading,
    error: nftError,
  } = useQuery(GET_MY_NFTS);

  if (nftLoading) return <Text>Loading...</Text>;
  if (nftError)  return <Text>Error: {nftError.message}</Text>;

  const myNfts = nftData?.myNfts || [];

  return (
    <Box p={6}>
      {/* ── 総残高カード ───────────────── */}
      <Stat
        mb={8}
        borderWidth="1px"
        borderRadius="md"
        p={4}
        maxW="240px"
        bg="gray.50"
      >
        <StatLabel>総残高 (JPY)</StatLabel>
        <StatNumber>¥{balance.toLocaleString()}</StatNumber>
      </Stat>

      {/* ── NFT 一覧 & アクション ─────────── */}
      <Text fontSize="xl" mb={4}>
        自分の NFT 一覧
      </Text>

      <Button
        onClick={() => router.push("/nft/mint")}
        colorScheme="blue"
        mb={4}
      >
        NFT を新規発行
      </Button>
      <Button
        onClick={() => router.push("/nft/market")}
        colorScheme="teal"
        ml={4}
      >
        マーケットを見る
      </Button>

      <SimpleGrid columns={[1, 2, 3]} spacing={6} mt={4}>
        {myNfts.map((nft: any) => (
          <Box key={nft.id} borderWidth="1px" borderRadius="md" p={4}>
            <Text>Title:&nbsp;{nft.title || "Untitled"}</Text>
            <Text>Owner:&nbsp;{nft.owner?.id}</Text>
            <Text>For&nbsp;Sale:&nbsp;{nft.isForSale ? "Yes" : "No"}</Text>
            <Text>Price:&nbsp;{nft.price ?? "N/A"}</Text>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
}
