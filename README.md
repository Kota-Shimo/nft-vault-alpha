# NFT Vault α (P1012リレーション修正版, NestJS v9 + Apollo v10.0.19)

Prismaのリレーションを両方向に定義して `missing an opposite relation field (P1012)` を解消し、  
`@nestjs/apollo@10.0.19` を使って ETARGETエラーを回避したサンプルです。

## 構成

- フロント: Next.js + TypeScript + Chakra UI
- バック: NestJS v9 + GraphQL (Apollo) + Prisma
- docker-compose.yml (Postgres, Redis) は任意
- Move/Ethereumのスマートコントラクト雛形

## セットアップ

1. (任意) `docker-compose up -d` で Postgres / Redis 起動
2. `cd backend` → `npm install` → `npx prisma migrate dev`
3. `npm run start:dev` (http://localhost:4000/graphql)
4. `cd ../frontend` → `npm install` → `npm run dev` (http://localhost:3000)
