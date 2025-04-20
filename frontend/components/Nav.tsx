/* frontend/components/Nav.tsx */
import NextLink   from 'next/link';
import { Flex, Link, Spacer, Button } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

/** 「クライアントでマウント済みか」を判定するフック */
const useIsClient = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
};

export default function Nav() {
  const router   = useRouter();
  const mounted  = useIsClient();                 // ← 追加
  const token    = mounted ? localStorage.getItem('token') : null;

  const logout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <Flex p={4} borderBottom="1px" borderColor="gray.200">
      {/* 左側リンク ‐ ここは常に表示 */}
      <Link as={NextLink} href="/" mr={4}>
        Home
      </Link>

      {/* token がある場合のみ。mounted===false の間は描画しないので SSR と一致 */}
      {mounted && token && (
        <>
          <Link as={NextLink} href="/dashboard"  mr={4}>Dashboard</Link>
          <Link as={NextLink} href="/journal"    mr={4}>Journal</Link>
          <Link as={NextLink} href="/proofs"     mr={4}>Proofs</Link>
          <Link as={NextLink} href="/nft/market" mr={4}>Marketplace</Link>
        </>
      )}

      <Spacer />

      {/* 右側認証エリア ‐ 同じく mounted チェック */}
      {mounted && token ? (
        <Button size="sm" onClick={logout}>Logout</Button>
      ) : (
        mounted && (
          <>
            <Link as={NextLink} href="/login"    mr={3}>Login</Link>
            <Link as={NextLink} href="/register">Register</Link>
          </>
        )
      )}
    </Flex>
  );
}
