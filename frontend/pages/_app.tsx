import type { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import { ApolloProvider } from '@apollo/client';
import { client } from '../graphql/client';
import Nav from '../components/Nav';
import { useTokenReady } from '../lib/useTokenReady';

export default function MyApp({ Component, pageProps }: AppProps) {
  const ready = useTokenReady();       // ★ 追加

  /* まだ token を読んでいない間は何も描画しない */
  if (!ready) return null;

  return (
    <ApolloProvider client={client}>
      <ChakraProvider>
        <Nav />
        <Component {...pageProps} />
      </ChakraProvider>
    </ApolloProvider>
  );
}
