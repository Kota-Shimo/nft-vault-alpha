import { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { CONNECT_WALLET } from "../graphql/mutations";

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);

  const [connectWalletMutation] = useMutation(CONNECT_WALLET);

  useEffect(() => {
    const storedToken = localStorage.getItem("vault_token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const connectWallet = async (walletAddress: string, signature: string, chainType: string) => {
    try {
      console.log("🛫 connectWallet called with:", { walletAddress, signature, chainType });

      const { data } = await connectWalletMutation({
        variables: {
          input: { walletAddress, signature, chainType },
        },
      });

      console.log("✅ connectWallet response:", data);

      if (data?.connectWallet?.token) {
        setToken(data.connectWallet.token);
        localStorage.setItem("vault_token", data.connectWallet.token);
        setUser(data.connectWallet.user);
        console.log("🔐 JWT saved, user set.");
      } else {
        console.warn("⚠️ Token not returned from connectWallet");
      }
    } catch (err) {
      console.error("❌ GraphQL connectWallet failed:", err);
    }
  };

  const logout = () => {
    localStorage.removeItem("vault_token");
    setToken(null);
    setUser(null);
  };

  return { user, token, connectWallet, logout };
};
