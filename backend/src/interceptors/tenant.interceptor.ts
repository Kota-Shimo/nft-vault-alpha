import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
    ForbiddenException,
  } from '@nestjs/common';
  import { PrismaService } from '../prisma.service';
  import { Observable } from 'rxjs';
  import { map } from 'rxjs/operators';
  
  @Injectable()
  export class TenantInterceptor implements NestInterceptor {
    constructor(private prisma: PrismaService) {}
  
    intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
      const gqlCtx   = ctx.getArgByIndex(2);
      const tenantId = gqlCtx.tenantId;
      if (!tenantId) throw new ForbiddenException('TenantId missing');
  
      /* Prisma の $use を流用して tenantId を自動注入 */
      this.prisma.$use((params, proceed) => {
        if (params.model && params.action === 'findMany') {
          params.args.where = {
            ...(params.args.where || {}),
            tenantId,
          };
        }
        if (params.model && params.action.startsWith('find') && params.action !== 'findMany') {
          params.args.where = {
            ...(params.args.where || {}),
            tenantId,
          };
        }
        if (params.model && params.args?.data) {
          params.args.data.tenantId ??= tenantId; // create / update
        }
        return proceed(params);
      });
  
      return next.handle().pipe(
        map((data) => data),
      );
    }
  }
  