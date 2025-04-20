import { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { useRouter } from 'next/router';
import { Box, Input, Button, Text } from '@chakra-ui/react';

const REGISTER = gql`
  mutation Register($email: String!, $password: String!) {
    register(email: $email, password: $password)
  }
`;

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [register, { loading, error, data }] = useMutation(REGISTER);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await register({ variables: { email, password } });
  };

  // 登録成功後は /login へ誘導
  if (data?.register) {
    router.replace('/login');
  }

  return (
    <Box maxW="sm" mx="auto" mt={10} p={4} borderWidth="1px" rounded="md">
      <form onSubmit={onSubmit}>
        <label>
          Email
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            mb={3}
            required
          />
        </label>
        <label>
          Password
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            mb={3}
            required
          />
        </label>
        <Button type="submit" isLoading={loading} colorScheme="teal" w="full">
          新規登録
        </Button>
        {error && (
          <Text color="red.500" mt={2}>
            {error.message}
          </Text>
        )}
      </form>
    </Box>
  );
}
