/* -------- backend/src/main.ts -------- */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Catch, HttpException } from '@nestjs/common';
import { GqlArgumentsHost, GqlExceptionFilter } from '@nestjs/graphql';
import * as bodyParser from 'body-parser';
import * as jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

/* ─ JSON logger ─ */
import { createLogger, transports, format } from 'winston';
const logger = createLogger({
  level: 'info',
  transports: [new transports.Console({ format: format.json() })],
});

/* ─ GraphQL exception filter ─ */
@Catch(HttpException)
class GqlHttpExceptionFilter implements GqlExceptionFilter {
  catch(exc: HttpException, host: Parameters<GqlExceptionFilter['catch']>[1]) {
    const gqlHost = GqlArgumentsHost.create(host);
    const info    = gqlHost.getInfo();
    const req     = gqlHost.getContext().req as Request;
    const user    = (req as any).user ?? {};

    const res = exc.getResponse() as any;
    res.field = info.fieldName;
    res.uid   = user.sub ?? 'anon';

    logger.warn({ msg: 'GQL_ERR', ...res });
    return exc;
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);   // Nest 標準ログのまま

  /* 環境変数デバッグ */
  logger.info({ msg: 'ENV', EVM_RPC_URL: process.env.EVM_RPC_URL ?? '<undef>' });

  /* Stripe raw body */
  app.use('/stripe/webhook', bodyParser.raw({ type: 'application/json' }));

  /* JWT → req.user */
  app.use((req: Request, _res: Response, next: NextFunction) => {
    const hdr = req.headers.authorization;
    if (hdr?.startsWith('Bearer ')) {
      try {
        const payload: any = jwt.verify(
          hdr.slice(7),
          process.env.JWT_SECRET || 'dev-secret',
        );
        (req as any).user = {
          sub:      payload.sub ?? payload.id,
          email:    payload.email,
          tenantId: payload.tenantId ?? null,
        };
      } catch (e: any) {
        logger.warn({ msg: 'JWT verify failed', err: e.message });
      }
    }
    next();
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalFilters(new GqlHttpExceptionFilter());

  /* CORS */
  app.enableCors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (origin.startsWith('http://localhost:3000')) return cb(null, true);
      if (origin.startsWith('http://localhost:4000')) return cb(null, true);
      if (/\.vercel\.app$/.test(origin)) return cb(null, true);
      return cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
  });

  const PORT = Number(process.env.PORT) || 4000;
  await app.listen(PORT);
  logger.info({ msg: 'SERVER_START', url: `http://localhost:${PORT}/graphql` });
}
bootstrap();
