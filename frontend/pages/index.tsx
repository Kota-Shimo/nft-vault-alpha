import { useQuery, gql } from "@apollo/client";
import { Box, Text, Image, SimpleGrid } from "@chakra-ui/react";
import { WalletConnector } from "../components/WalletConnector"; // ✅ 追加！

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

export default function Dashboard() {
  const { data, loading, error } = useQuery(GET_MY_NFTS, {
    variables: { chainType: null }, // ← "EVM" or "APTOS" も可能
  });

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <Box p={6}>
      <Text fontSize="2xl" mb={4}>My NFTs</Text>

      {/* ✅ Connect Walletボタンを表示 */}
      <WalletConnector />

      <SimpleGrid columns={[1, 2, 3]} spacing={4} mt={6}>
        {data.myNfts.map((nft: any) => (
          <Box key={nft.id} borderWidth="1px" borderRadius="md" p={4}>
            <Text fontWeight="bold">{nft.title}</Text>
            <Text fontSize="sm" color="gray.500">{nft.chainType}</Text>
            <Image
              mt={2}
              src={`http://localhost:26659/data_by_hash/${nft.metadataHash.replace("celestia://", "")}`}
              alt={nft.title}
              fallbackSrc="/placeholder.png"
            />
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
}
