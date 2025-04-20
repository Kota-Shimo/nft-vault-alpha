import { gql, useQuery, useMutation } from "@apollo/client";
import { Box, Image, Text, SimpleGrid, Button } from "@chakra-ui/react";

const GET_MARKET_NFTS = gql`
  query MarketNfts($chainType: String) {
    marketNfts(chainType: $chainType) {
      id
      title
      metadataHash
      chainType
      isForSale
      price
    }
  }
`;

const BUY_NFT = gql`
  mutation BuyNft($input: BuyNftInput!) {
    buyNft(input: $input) {
      id
      isForSale
      owner {
        id
      }
    }
  }
`;

export default function MarketPage() {
  const { data, loading, error, refetch } = useQuery(GET_MARKET_NFTS, {
    variables: { chainType: null },
  });

  const [buyNft] = useMutation(BUY_NFT);

  const handleBuy = async (nftId: string) => {
    await buyNft({ variables: { input: { nftId } } });
    await refetch(); // 画面を最新状態に
  };

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <Box p={6}>
      <Text fontSize="2xl" mb={4}>Marketplace</Text>
      <SimpleGrid columns={[1, 2, 3]} spacing={6}>
        {data.marketNfts.map((nft: any) => (
          <Box key={nft.id} borderWidth="1px" borderRadius="md" p={4}>
            <Text fontWeight="bold">{nft.title}</Text>
            <Text>{nft.chainType}</Text>
            <Text color="green.500">Price: {nft.price || "Free"}</Text>
            <Image
              mt={2}
              src={`http://localhost:26659/data_by_hash/${nft.metadataHash.replace("celestia://", "")}`}
              alt={nft.title}
            />
            {nft.isForSale && (
              <Button mt={2} colorScheme="green" onClick={() => handleBuy(nft.id)}>
                購入する
              </Button>
            )}
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
}
    