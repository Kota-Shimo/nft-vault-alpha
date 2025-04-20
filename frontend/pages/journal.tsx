/* frontend/pages/journal.tsx
   ───────────────────────── */
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { gql, useQuery } from '@apollo/client';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  Spinner,
  Text,
  Badge,
} from '@chakra-ui/react';

/* ───────── GraphQL ───────── */
const LIST = gql`
  query ($tenantId: String!) {
    journal(tenantId: $tenantId) {
      id
      accountDr
      accountCr
      amountJpy
      freeeDealId        # ←★ 追加
    }
  }
`;

export default function JournalPage() {
  const router = useRouter();

  /* ① トークンガード ───────────────── */
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.replace('/login');
  }, [router]);

  /* ② データ取得 ───────────────────── */
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

  /* ③ テーブル描画 ─────────────────── */
  return (
    <Box maxW="4xl" mx="auto" mt={6}>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>借方</Th>
            <Th>貸方</Th>
            <Th isNumeric>金額 (¥)</Th>
            <Th w="100px">Status</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data?.journal.map((j: any) => (
            <Tr key={j.id}>
              <Td>{j.accountDr}</Td>
              <Td>{j.accountCr}</Td>
              <Td isNumeric>{j.amountJpy.toLocaleString()}</Td>
              <Td>
                <Badge colorScheme={j.freeeDealId ? 'green' : 'yellow'}>
                  {j.freeeDealId ? 'sent' : 'pending'}
                </Badge>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
