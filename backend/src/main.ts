/* -------------  backend/src/main.ts  ------------- */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as bodyParser from 'body-parser';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  /* 🚩 デフォルト body‑parser を有効のまま生成 */
  const app = await NestFactory.create(AppModule);

  /* 環境変数確認 (デバッグ用) */
  console.log('EVM_RPC_URL =', process.env.EVM_RPC_URL ?? '<<undefined>>');

  /* ───── Stripe Webhook だけ raw Body ───── */
  app.use(
    '/stripe/webhook',
    bodyParser.raw({ type: 'application/json' }),
  );
  /* ※ それ以外のルートは Nest が自動で JSON パースする */

  /* ───── JWT ミドルウェア ───── */
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
        /* invalid token → 匿名扱い */
      }
    }
    next();
  });

  /* ───── バリデーション ───── */
  app.useGlobalPipes(new ValidationPipe());

  /* ───── CORS ───── */
  app.enableCors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // curl 等
      if (origin.startsWith('http://localhost:3000')) return cb(null, true);
      if (origin.startsWith('http://localhost:4000')) return cb(null, true);
      if (/\.vercel\.app$/.test(origin)) return cb(null, true);
      return cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
  });

  /* ───── 起動 ───── */
  const PORT = Number(process.env.PORT) || 4000;
  await app.listen(PORT);
  console.log(`✅ Backend is running on http://localhost:${PORT}/graphql`);
}
bootstrap();
