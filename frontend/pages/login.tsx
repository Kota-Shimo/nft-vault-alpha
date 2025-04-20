/* -------------  frontend/pages/login.tsx  ------------- */
import { useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import { useRouter } from 'next/router';
import {
  Box,
  Input,
  Button,
  Text,
  VStack,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';

/* ✅ email / password を２引数で渡す新しいミューテーション */
const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password)
  }
`;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');

  const [login, { loading }] = useMutation(LOGIN, {
    onCompleted: ({ login }) => {
      localStorage.setItem('token', login);     // ← ここに JWT
      router.push('/dashboard');                // 好きな遷移先に変更可
    },
    onError: () => setError('認証に失敗しました'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    login({ variables: { email, password } });  // ← 変数で渡す
  };

  return (
    <Box maxW="sm" mx="auto" mt={10} p={4} borderWidth="1px" borderRadius="md">
      <form onSubmit={handleSubmit}>
        <VStack spacing={3} align="stretch">
          <Input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button
            type="submit"
            isLoading={loading}
            colorScheme="teal"
            w="full"
          >
            ログイン
          </Button>

          {error && (
            <Alert status="error" fontSize="sm">
              <AlertIcon />
              {error}
            </Alert>
          )}
        </VStack>
      </form>
    </Box>
  );
}
