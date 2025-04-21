/* frontend/pages/proof.tsx
   ───────────────────────── */
   import { useEffect } from 'react';
   import { useRouter } from 'next/router';
   import { useQuery } from '@apollo/client';
   import {
     SimpleGrid,
     Box,
     Link,
     Spinner,
     Text,
     Badge,
     Center,
   } from '@chakra-ui/react';
   import { GET_PROOFS } from '../graphql/queries';           // ← 共通クエリを利用
   
   export default function ProofPage() {
     const router = useRouter();
   
     /* ───────── ① 認証ガード ───────── */
     useEffect(() => {
       if (!localStorage.getItem('token')) router.replace('/login');
     }, [router]);
   
     /* ───────── ② データ取得 ───────── */
     const { data, loading, error } = useQuery(GET_PROOFS, {
       variables: { tenantId: 'default-tenant' },            // TODO: 実テナント ID
       fetchPolicy: 'no-cache',
     });
   
     if (loading)
       return (
         <Center h="70vh">
           <Spinner />
         </Center>
       );
   
     if (error)
       return (
         <Center h="70vh">
           <Text color="red.500">{error.message}</Text>
         </Center>
       );
   
     const proofs = data?.proofs ?? [];
   
     return (
       <SimpleGrid columns={[1, 2, 3]} spacing={6} maxW="6xl" mx="auto" mt={8}>
         {proofs.map((p: any) => (
           <Box key={p.id} p={4} borderWidth="1px" rounded="md" shadow="sm">
             <Text fontSize="sm" isTruncated>
               Proof&nbsp;ID:&nbsp;{p.id}
             </Text>
             <Text fontSize="sm" isTruncated>
               Tx&nbsp;ID:&nbsp;{p.txId}
             </Text>
             <Text fontSize="xs" mb={2} wordBreak="break-all">
               {p.celestiaHash}
             </Text>
   
             <Link href={p.pdfUrl} isExternal color="teal.600" fontWeight="bold">
               PDF ダウンロード
             </Link>
   
             <Badge mt={2} colorScheme="purple">
               {p.tx?.amountJpy
                 ? `¥${p.tx.amountJpy.toLocaleString()}`
                 : '—'}
             </Badge>
           </Box>
         ))}
       </SimpleGrid>
     );
   }
   