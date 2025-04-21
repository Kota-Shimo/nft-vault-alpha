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

/* ミューテーション: email と password を変数で渡す */
const LOGIN = gql`
  mutation ($email: String!, $password: String!) {
    login(email: $email, password: $password)
  }
`;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  /* 共有 ApolloClient（_app.tsx で Provider 済）を使用 */
  const [login, { loading }] = useMutation(LOGIN, {
    onCompleted: ({ login }) => {
      console.log('JWT', login);                    // ← デバッグ用
      localStorage.setItem('token', login);        // ★ 必ず保存
      router.push('/dashboard');                   // ⇒ 次ページでヘッダー付与
    },
    onError: () => setError('認証に失敗しました'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    login({ variables: { email, password } });
  };

  return (
    <Box maxW="sm" mx="auto" mt={10} p={4} borderWidth="1px" rounded="md">
      <form onSubmit={handleSubmit}>
        <VStack spacing={3}>
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
          <Button type="submit" colorScheme="teal" w="full" isLoading={loading}>
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
