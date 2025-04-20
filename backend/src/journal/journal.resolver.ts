/* backend/src/journal/journal.resolver.ts
   ─────────────────────────────────────── */
import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { ObjectType, Field, Float, ID, Int } from '@nestjs/graphql';
import { JournalService } from './journal.service';

@Resolver()
export class JournalResolver {
  constructor(private readonly journalSvc: JournalService) {}

  /** 仕訳一覧 */
  @Query(() => [Journal])
  async journal(@Args('tenantId') tenantId: string) {
    return this.journalSvc.list(tenantId);
  }

  /** CSV(base64) */
  @Query(() => String)
  async journalCsv(@Args('tenantId') tenantId: string) {
    return this.journalSvc.exportCsv(tenantId);
  }

  /** 手動生成 (β) */
  @Mutation(() => Boolean)
  async generateJournal(@Args('tenantId') tenantId: string) {
    await this.journalSvc.generateForTenant(tenantId);
    return true;
  }
}

/*──────── GraphQL 型定義 ────────*/
@ObjectType()
class Journal {
  @Field(() => ID)    id!: string;
  @Field()            accountDr!: string;
  @Field()            accountCr!: string;
  @Field(() => Float) amountJpy!: number;

  /* ★ freee に送信済みなら dealId が入る（未送信は null） */
  @Field(() => Int, { nullable: true })
  freeeDealId?: number | null;
}
