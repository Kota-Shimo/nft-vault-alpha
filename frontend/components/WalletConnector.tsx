import React, { useState } from "react";
import { Button, VStack, Text } from "@chakra-ui/react";
import { ethers } from "ethers";
import { useAuth } from "../hooks/useAuth";

declare global {
  interface Window {
    aptos?: any;
    ethereum?: any;
  }
}

export const WalletConnector: React.FC = () => {
  const [userAddress, setUserAddress] = useState("");
  const { connectWallet } = useAuth();

  // ✅ EVM接続（MetaMask）
  const handleEVMConnect = async () => {
    console.log("🟣 MetaMaskボタンがクリックされました");

    if (!window.ethereum) {
      alert("MetaMaskをインストールしてください");
      return;
    }

    try {
      console.log("📡 MetaMask接続要求中...");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      setUserAddress(address);
      console.log("✅ アドレス取得:", address);

      const message = `Login to NFT Vault α with address: ${address}`;
      const signature = await signer.signMessage(message);
      console.log("📝 署名成功:", signature);

      await connectWallet(address, signature, "EVM");
      console.log("✅ connectWallet 実行完了");
    } catch (err) {
      console.error("❌ MetaMask接続中にエラー:", err);
    }
  };

  // ✅ Aptos接続（Petra）
  const handleAptosConnect = async () => {
    console.log("🟠 Petraボタンがクリックされました");

    if (!window.aptos) {
      alert("Petra Wallet をインストールしてください");
      return;
    }

    try {
      const response = await window.aptos.connect();
      const address = response.address;
      setUserAddress(address);
      console.log("✅ Aptosアドレス取得:", address);

      const message = `Login to NFT Vault α with address: ${address}`;
      const signatureResponse = await window.aptos.signMessage({
        message,
        nonce: Math.random().toString(36).substring(2),
      });

      const signature = signatureResponse.signature;
      console.log("📝 Petra署名成功:", signature);

      await connectWallet(address, signature, "APTOS");
      console.log("✅ connectWallet 実行完了");
    } catch (err) {
      console.error("❌ Petra接続中にエラー:", err);
    }
  };

  return (
    <VStack>
      <Button onClick={handleEVMConnect} colorScheme="purple">
        Connect EVM Wallet (MetaMask)
      </Button>
      <Button onClick={handleAptosConnect} colorScheme="orange">
        Connect Aptos Wallet (Petra)
      </Button>
      {userAddress && <Text>接続中: {userAddress}</Text>}
    </VStack>
  );
};
