import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { StripeService } from './stripe.service';
import { Plan } from './plan.enum';

@Resolver()
export class BillingResolver {
  constructor(private readonly stripeSvc: StripeService) {}

  @Mutation(() => String)
  async createCheckout(
    @Args('tenantId') tenantId: string,
    @Args('plan', { type: () => Plan }) plan: Plan,   // ★型を明示
  ): Promise<string> {
    return this.stripeSvc.createCheckout(tenantId, plan);
  }
}
