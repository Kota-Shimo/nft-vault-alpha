/* frontend/pages/dashboard/index.tsx
   ────────────────────────────────── */
   import React from 'react';
   import { useRouter } from 'next/router';
   import { useQuery } from '@apollo/client';
   import {
     Box,
     Button,
     SimpleGrid,
     Text,
     Stat,
     StatLabel,
     StatNumber,
     Spinner,
     Center,
   } from '@chakra-ui/react';
   import {
     GET_TOTAL_BALANCE,
     GET_MY_NFTS,
   } from '../../graphql/queries';
   
   export default function Dashboard() {
     const router = useRouter();
   
     /* 0) まずブラウザで token を取得（SSR では null） */
     const token =
       typeof window !== 'undefined' ? localStorage.getItem('token') : null;
   
     /* ───────── ① 総残高 (JPY) ───────── */
     const { data: balData, loading: balLoading } = useQuery(GET_TOTAL_BALANCE, {
       pollInterval: 300_000,            // 5 分ごと更新
       fetchPolicy : 'no-cache',
       skip        : !token,             // token が無ければクエリを撃たない
     });
     const balance: number = balData?.totalBalanceJpy ?? 0;
   
     /* ───────── ② NFT 一覧 ───────── */
     const {
       data: nftData,
       loading: nftLoading,
       error: nftError,
     } = useQuery(GET_MY_NFTS, {
       fetchPolicy: 'no-cache',
       skip       : !token,              // 同様に skip
     });
   
     /* ローディング表示 */
     if (balLoading || nftLoading)
       return (
         <Center h="70vh">
           <Spinner />
         </Center>
       );
   
     /* エラー表示 */
     if (nftError)
       return (
         <Center h="70vh">
           <Text color="red.500">{nftError.message}</Text>
         </Center>
       );
   
     const myNfts = nftData?.myNfts ?? [];
   
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
           shadow="sm"
         >
           <StatLabel>総残高 (JPY)</StatLabel>
           <StatNumber>¥{balance.toLocaleString()}</StatNumber>
         </Stat>
   
         {/* ── 操作ボタン ───────────────── */}
         <Button onClick={() => router.push('/nft/mint')} colorScheme="blue" mb={4}>
           NFT を新規発行
         </Button>
         <Button
           onClick={() => router.push('/nft/market')}
           colorScheme="teal"
           ml={4}
           mb={4}
         >
           マーケットを見る
         </Button>
   
         {/* ── NFT 一覧 ─────────────────── */}
         <Text fontSize="xl" mb={2}>
           自分の NFT 一覧
         </Text>
   
         {myNfts.length === 0 ? (
           <Text>保有 NFT はありません。</Text>
         ) : (
           <SimpleGrid columns={[1, 2, 3]} spacing={6} mt={2}>
             {myNfts.map((nft: any) => (
               <Box key={nft.id} borderWidth="1px" borderRadius="md" p={4}>
                 <Text fontWeight="bold" mb={1}>
                   {nft.title || 'Untitled'}
                 </Text>
                 <Text fontSize="sm">NFT ID: {nft.id}</Text>
                 <Text fontSize="sm">Owner: {nft.owner?.id}</Text>
                 <Text fontSize="sm">
                   For Sale: {nft.isForSale ? 'Yes' : 'No'}
                 </Text>
                 <Text fontSize="sm">Price: {nft.price ?? 'N/A'}</Text>
               </Box>
             ))}
           </SimpleGrid>
         )}
       </Box>
     );
   }
   