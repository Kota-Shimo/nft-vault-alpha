import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { BillingResolver } from './billing.resolver';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [StripeService, BillingResolver, PrismaService],
  exports: [StripeService],
})
export class BillingModule {}
