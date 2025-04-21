/* frontend/pages/index.tsx  ─────────────────────────
 *  ‑ 未ログイン時は GraphQL を撃たないよう skip を追加
 *  ‑ ウォレット接続ボタンはそのまま表示
 */
import { useQuery, gql } from '@apollo/client';
import {
  Box,
  Text,
  Image,
  SimpleGrid,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { WalletConnector } from '../components/WalletConnector';

/* GraphQL */
const GET_MY_NFTS = gql`
  query MyNfts($chainType: String) {
    myNfts(chainType: $chainType) {
      id
      title
      metadataHash
      chainType
    }
  }
`;

export default function Home() {
  /* ① token を取得（SSR は null） */
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  /* ② token が無ければクエリを skip */
  const {
    data,
    loading,
    error,
  } = useQuery(GET_MY_NFTS, {
    variables: { chainType: null },   // "EVM" | "APTOS" も可
    skip: !token,                     // ← 重要
    fetchPolicy: 'no-cache',
  });

  /* ───────── UI ───────── */
  if (!token)
    return (
      <Center h="70vh">
        <Text>ログインしてください</Text>
      </Center>
    );

  if (loading)
    return (
      <Center h="70vh">
        <Spinner />
      </Center>
    );

  if (error)
    return (
      <Center h="70vh">
        <Text color="red.500">Error: {error.message}</Text>
      </Center>
    );

  return (
    <Box p={6}>
      <Text fontSize="2xl" mb={4}>
        My NFTs
      </Text>

      {/* ウォレット接続ボタン */}
      <WalletConnector />

      <SimpleGrid columns={[1, 2, 3]} spacing={4} mt={6}>
        {data.myNfts.map((nft: any) => (
          <Box key={nft.id} borderWidth="1px" borderRadius="md" p={4}>
            <Text fontWeight="bold">{nft.title}</Text>
            <Text fontSize="sm" color="gray.500">
              {nft.chainType}
            </Text>
            <Image
              mt={2}
              src={`http://localhost:26659/data_by_hash/${nft.metadataHash.replace(
                'celestia://',
                '',
              )}`}
              alt={nft.title}
              fallbackSrc="/placeholder.png"
            />
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
}
