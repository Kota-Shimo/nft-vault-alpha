/* -------------  frontend/pages/journal.tsx  ------------- */
import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  HStack,
  Badge,
  useToast,
  Center,
} from '@chakra-ui/react';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client';
import {
  GET_JOURNAL,
  GET_JOURNAL_CSV,
  MUTATE_GENERATE,
  MUTATE_FREEE,
} from '../graphql/queries';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

/* ───────── 認証ガード ───────── */
const useAuthGuard = () => {
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
      router.replace('/login');
    }
  }, [router]);
};

export default function JournalPage() {
  useAuthGuard();
  const toast = useToast();

  /* ① 一覧取得 ─── もう variables は不要 */
  const { data, loading, error, refetch } = useQuery(GET_JOURNAL, {
    fetchPolicy: 'no-cache',
  });

  /* ② CSV 取得（遅延クエリ） */
  const [fetchCsv]   = useLazyQuery(GET_JOURNAL_CSV, { fetchPolicy: 'network-only' });

  /* ③ ミューテーション */
  const [generate]   = useMutation(MUTATE_GENERATE);
  const [sendFreee]  = useMutation(MUTATE_FREEE);

  /* ───────── ハンドラ ───────── */
  const handleGenerate = async () => {
    await generate();
    toast({ title: '仕訳を生成しました', status: 'success' });
    refetch();
  };

  const handleSend = async () => {
    await sendFreee();
    toast({ title: 'freee へ送信しました', status: 'success' });
    refetch();
  };

  const handleCsv = async () => {
    const { data } = await fetchCsv();
    const b64 = data?.journalCsv;
    if (!b64) return;
    const blob = new Blob([atob(b64)], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `journal.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ───────── UI ───────── */
  if (loading) return <Center h="70vh"><Spinner /></Center>;

  if (error)   return <Center h="70vh"><Box color="red.500">{error.message}</Box></Center>;

  const journals = data?.journal ?? [];

  return (
    <Box p={6}>
      <HStack mb={4} spacing={4}>
        <Button colorScheme="teal"   onClick={handleGenerate}>仕訳を生成</Button>
        <Button colorScheme="orange" onClick={handleSend}>freee へ送信</Button>
        <Button variant="outline"    onClick={handleCsv}>CSV DL</Button>
      </HStack>

      <Table variant="striped" size="sm">
        <Thead>
          <Tr>
            <Th>ID</Th>
            <Th>借方</Th>
            <Th>貸方</Th>
            <Th isNumeric>金額 (¥)</Th>
            <Th>Status</Th>
          </Tr>
        </Thead>
        <Tbody>
          {journals.map((j: any) => (
            <Tr key={j.id}>
              <Td>{j.id}</Td>
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
