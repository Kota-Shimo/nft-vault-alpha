import {
  Controller,
  Post,
  Headers,
  Req,
  Res,
  HttpCode,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { Request, Response } from 'express';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeSvc: StripeService) {}

  /** Stripe Webhook: raw body 必須 (main.ts で bodyParser.raw を設定済み) */
  @Post('webhook')
  @HttpCode(200)
  async handle(
    @Headers('stripe-signature') sig: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      // req.body は Buffer 型（bodyParser.raw で設定）
      await this.stripeSvc.handleWebhook(sig, req.body as Buffer);
      res.send({ received: true });
    } catch (err) {
      res.status(400).send(`Webhook Error: ${(err as any).message}`);
    }
  }
}
