import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
  } from '@nestjs/common';
  import { GqlExecutionContext } from '@nestjs/graphql';
  
  @Injectable()
  export class TenantGuard implements CanActivate {
    canActivate(ctx: ExecutionContext): boolean {
      // GraphQL のコンテキストを取得
      const gqlCtx = GqlExecutionContext.create(ctx).getContext();
      const user   = gqlCtx.req?.user;           // JWT があれば { id, tenantId, ... }
  
      // ★ 未認証（user undefined）のリクエストは通す
      if (!user) return true;
  
      // 認証済みでも tenantId が無ければ拒否
      if (!user.tenantId)
        throw new ForbiddenException('TenantId missing');
  
      return true; // tenantId があれば OK
    }
  }
  