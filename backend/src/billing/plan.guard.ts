import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma.service';
import { Plan } from './plan.enum';

@Injectable()
export class PlanGuard implements CanActivate {
  constructor(private reflector: Reflector, private prisma: PrismaService) {}

  async canActivate(ctx: ExecutionContext) {
    const required = this.reflector.get<Plan>('plan', ctx.getHandler());
    if (!required) return true;

    const req = ctx.getArgByIndex(2).req; // GraphQL context
    const tenantId = req.user?.tenantId;
    if (!tenantId) throw new ForbiddenException('No tenant');

    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new ForbiddenException('Tenant not found');

    if (tenant.plan === Plan.ENTERPRISE) return true;
    if (tenant.plan === required) return true;

    throw new ForbiddenException(`Requires ${required} plan`);
  }
}
