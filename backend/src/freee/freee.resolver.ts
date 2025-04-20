/* backend/src/freee/freee.resolver.ts
   ─────────────────────────────── */
   import { Resolver, Mutation, Args } from '@nestjs/graphql';
   import { FreeeService }             from './freee.service';
   
   @Resolver()
   export class FreeeResolver {
     constructor(private readonly svc: FreeeService) {}
   
     /** 仕訳を freee へ手動送信（テスト用） */
     @Mutation(() => Boolean)
     async sendJournalToFreee(
       @Args('tenantId') tenantId: string,        // companyId は .env で固定
     ): Promise<boolean> {
       return this.svc.sendJournal(tenantId);
     }
   }
   