/* -------------  backend/src/main.ts  ------------- */
import { NestFactory }       from '@nestjs/core';
import { AppModule }         from './app.module';
import { ValidationPipe }    from '@nestjs/common';
import * as jwt              from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  /* ────────── Nest アプリ生成 ────────── */
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  /* ────────── ここで .env が正しく読めているか確認 ────────── */
  /* このログに Mainnet URL がそのまま出れば OK。違えば .env の読み込み位置を確認 */
  console.log('EVM_RPC_URL =', process.env.EVM_RPC_URL ?? '<<undefined>>');

  /* ────────── JWT ミドルウェア ────────── */
  app.use((req: Request, _res: Response, next: NextFunction) => {
    const hdr = req.headers.authorization;
    if (hdr?.startsWith('Bearer ')) {
      try {
        const payload = jwt.verify(
          hdr.slice(7),
          process.env.JWT_SECRET || 'dev-secret',
        ) as any;
        (req as any).user = { id: payload.sub ?? payload.id };
      } catch {
        /* invalid token → 無視して匿名扱い */
      }
    }
    next();
  });

  /* ────────── バリデーション ────────── */
  app.useGlobalPipes(new ValidationPipe());

  /* ────────── CORS 設定 ────────── */
  app.enableCors({
    origin: (origin, cb) => {
      if (!origin)                               return cb(null, true); // curl 等
      if (origin.startsWith('http://localhost:3000')) return cb(null, true);
      if (origin.startsWith('http://localhost:4000')) return cb(null, true); // ★ 追加
      if (/\.vercel\.app$/.test(origin))               return cb(null, true);
      return cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
  });

  /* ────────── 起動 ────────── */
  const PORT = Number(process.env.PORT) || 4000;
  await app.listen(PORT);
  console.log(`✅ Backend is running on http://localhost:${PORT}/graphql`);
}
bootstrap();
