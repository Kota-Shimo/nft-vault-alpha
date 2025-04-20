import {
    ExecutionContext,
    Injectable
  } from '@nestjs/common';
  import { AuthGuard } from '@nestjs/passport';
  import { GqlExecutionContext } from '@nestjs/graphql';
  import { Reflector } from '@nestjs/core';
  
  /** ローカルストラテジ（email+password）用  */
  @Injectable()
  export class GqlLocalAuthGuard extends AuthGuard('local') {
    constructor(private readonly reflector: Reflector) {
      super();
    }
  
    /** GraphQL → HTTP の req へ橋渡し */
    getRequest(context: ExecutionContext) {
      const ctx = GqlExecutionContext.create(context);
      return ctx.getContext().req;
    }
  }
  
  /** JWT ストラテジ用（保護されたクエリに使用） */
  @Injectable()
  export class GqlJwtAuthGuard extends AuthGuard('jwt') {
    constructor(private readonly reflector: Reflector) {
      super();
    }
  
    getRequest(context: ExecutionContext) {
      const ctx = GqlExecutionContext.create(context);
      return ctx.getContext().req;
    }
  }
  