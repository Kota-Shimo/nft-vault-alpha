import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';

import { IS_PUBLIC } from '../common/public.decorator';

/* ───── JSON ロガー ───── */
import { createLogger, transports, format } from 'winston';
const logger = createLogger({
  level: 'info',
  transports: [new transports.Console({ format: format.json() })],
});

@Injectable()
export class TenantGuardV2 implements CanActivate {
  /** 旧フロント互換の公開フィールド */
  private static readonly LEGACY_PUBLIC = new Set(['login', 'register']);

  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    /* ── GraphQL Context 取得 ── */
    const gqlCtx   = GqlExecutionContext.create(ctx);
    const context  = gqlCtx.getContext(); // context オブジェクト
    const { req }  = context;
    const fieldKey = gqlCtx.getInfo().fieldName;

    /* ── 二重実行防止：context or req に記録 ── */
    const marker = '__tenantGuardChecked';
    if (context[marker] || req[marker]) {
      console.log('🌀 SKIPPED (context or req)');
      return true;
    }
    context[marker] = true;
    req[marker] = true;

    /* ── @Public() チェック ── */
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC,
      [ctx.getHandler(), ctx.getClass()],
    );
    if (isPublic) {
      console.log('▶ field=PUBLIC');
      return true;
    }

    /* ── 旧フロント互換フィールド判定 ── */
    const legacyHit = TenantGuardV2.LEGACY_PUBLIC.has(fieldKey);
    console.log(
      '▶ field =', fieldKey,
      '| legacy =', legacyHit,
      '| hasUser =', !!req?.user,
      '| userKeys =', req?.user ? Object.keys(req.user).length : 0,
    );
    if (legacyHit) return true;

    /* ── 未認証 (undefined / {} / subなし) は通過 ── */
    const user = req?.user;
    if (!user || Object.keys(user).length === 0 || !user.sub) return true;

    /* ── 認証済みなのに tenantId が無い → 403 ── */
    if (!user.tenantId) {
      console.trace('TRACE: TenantId missing');
      logger.warn({
        msg:   'TenantId missing',
        field: fieldKey,
        uid:   user.sub ?? 'anon',
        agent: req.headers['user-agent'],
      });
      throw new ForbiddenException('TenantId missing');
    }

    return true;
  }
}
