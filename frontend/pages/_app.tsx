import type { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import { ApolloProvider } from '@apollo/client';
import { client } from '../graphql/client';
import Nav from '../components/Nav';         // ← 追加（手順② で作成したコンポーネント）

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ApolloProvider client={client}>
      <ChakraProvider>
        <Nav />                {/* ここでナビバーを表示 */}
        <Component {...pageProps} />
      </ChakraProvider>
    </ApolloProvider>
  );
}
