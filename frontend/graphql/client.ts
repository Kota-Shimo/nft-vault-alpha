import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// GraphQL エンドポイント
const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
});

// ローカルストレージの token を Authorization ヘッダーへ付与
const authLink = setContext((_, { headers }) => {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
