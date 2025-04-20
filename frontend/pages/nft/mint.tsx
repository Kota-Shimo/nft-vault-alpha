import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { MINT_NFT } from "../../graphql/mutations";
import { Box, Input, Button, Textarea, Text, Image } from "@chakra-ui/react";

export default function MintPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string>("");

  const [mintNft, { data, loading, error }] = useMutation(MINT_NFT);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (selectedFile) {
      setPreviewURL(URL.createObjectURL(selectedFile));
    }
  };

  const handleMint = async () => {
    if (!file) return alert("画像ファイルを選択してください");

    try {
      const base64Data = await fileToBase64(file);
      await mintNft({
        variables: {
          input: {
            title,
            description,
            imageBase64: base64Data,
          },
        },
      });
    } catch (err: any) {
      console.error(err);
      alert("Mintに失敗しました");
    }
  };

  return (
    <Box p={6}>
      <Text fontSize="xl" mb={4}>NFT新規発行</Text>
      <Input 
        placeholder="タイトル" 
        value={title} 
        onChange={(e) => setTitle(e.target.value)} 
        mb={4}
      />
      <Textarea
        placeholder="説明文"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        mb={4}
      />
      <Input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        mb={4}
      />
      {previewURL && (
        <Box mb={4}>
          <Text>プレビュー:</Text>
          <Image src={previewURL} alt="preview" maxH="200px" />
        </Box>
      )}
      <Button onClick={handleMint} colorScheme="blue" isLoading={loading}>
        Mintする
      </Button>
      {error && <Text color="red.500">エラー: {error.message}</Text>}
      {data && <Text color="green.500">Mint成功: {data.mintNft.id}</Text>}
    </Box>
  );
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
  });
}
