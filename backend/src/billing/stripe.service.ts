import Stripe from 'stripe';
import { Injectable, Logger } from '@nestjs/common';
import { Plan } from './plan.enum';
import { PrismaService } from '../prisma.service';

@Injectable()
export class StripeService {
  private readonly log = new Logger(StripeService.name);

  /* v12+ 型定義に合わせて apiVersion は省略 */
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  constructor(private prisma: PrismaService) {}

  /* ───────── 価格 ID を返す ───────── */
  private priceId(plan: Plan): string {
    switch (plan) {
      case Plan.BUSINESS:
        return process.env.STRIPE_PRICE_BUSINESS!;
      case Plan.ENTERPRISE:
        return process.env.STRIPE_PRICE_ENTERPRISE!;
      default:
        return process.env.STRIPE_PRICE_STARTER!;
    }
  }

  /* ───────── Checkout セッション作成 ───────── */
  async createCheckout(tenantId: string, plan: Plan): Promise<string> {
    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/billing/success`,
      cancel_url: `${process.env.FRONTEND_URL}/billing`,
      line_items: [{ price: this.priceId(plan), quantity: 1 }],
      metadata: { tenantId },
    });
    return session.url!;
  }

  /* ───────── Webhook 受信 ───────── */
  async handleWebhook(sig: string, rawBody: Buffer) {
    const event = this.stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const tenantId = session.metadata?.tenantId;
      if (!tenantId) return;

      /* line_items API で priceId を取得 */
      const lineItems = await this.stripe.checkout.sessions.listLineItems(
        session.id,
        { limit: 1 },
      );
      const priceId = lineItems.data[0]?.price?.id ?? '';

      let plan = Plan.STARTER;
      if (priceId === process.env.STRIPE_PRICE_BUSINESS) plan = Plan.BUSINESS;
      if (priceId === process.env.STRIPE_PRICE_ENTERPRISE) plan = Plan.ENTERPRISE;

      await this.prisma.tenant.update({
        where: { id: tenantId },
        data: { plan },
      });

      this.log.log(`Tenant ${tenantId} upgraded to ${plan}`);
    }
  }
}
