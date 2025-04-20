import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { gql, useQuery } from '@apollo/client';
import {
  SimpleGrid,
  Box,
  Link,
  Spinner,
  Text,
} from '@chakra-ui/react';

const LIST = gql`
  query ($tenantId: String!) {
    proofs(tenantId: $tenantId) {
      id
      txId
      pdfUrl
      celestiaHash
    }
  }
`;

export default function ProofsPage() {
  const router = useRouter();

  // ── ① ガード ──
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.replace('/login');
  }, [router]);

  // ── ② データ取得 ──
  const { data, loading, error } = useQuery(LIST, {
    variables: { tenantId: 'default-tenant' },
    fetchPolicy: 'cache-and-network',
  });

  if (loading) return <Spinner mx="auto" mt={10} />;

  if (error)
    return (
      <Text color="red.500" mt={10} textAlign="center">
        {error.message}
      </Text>
    );

  return (
    <SimpleGrid columns={2} spacing={4} maxW="4xl" mx="auto" mt={6}>
      {data?.proofs.map((p: any) => (
        <Box key={p.id} p={3} borderWidth="1px" rounded="md">
          <div>Tx: {p.txId}</div>
          <div>Hash: {p.celestiaHash}</div>
          <Link href={p.pdfUrl} isExternal color="teal.600">
            PDF ダウンロード
          </Link>
        </Box>
      ))}
    </SimpleGrid>
  );
}
