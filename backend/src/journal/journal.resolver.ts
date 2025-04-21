/* backend/src/journal/journal.resolver.ts
   ────────────────────────────────────── */
   import {
    Resolver,
    Query,
    Mutation,
    Context,
    ObjectType,
    Field,
    ID,
    Float,
    Int,
  } from '@nestjs/graphql';
  import { JournalService } from './journal.service';
  
  /**
   * GraphQL Resolver for Journal
   * tenantId は JWT から解決するため
   * もうクエリ／ミューテーションの引数に含めない
   */
  @Resolver()
  export class JournalResolver {
    constructor(private readonly journalSvc: JournalService) {}
  
    /** 仕訳一覧 */
    @Query(() => [Journal])
    async journal(@Context() ctx: any) {
      const tenantId: string = ctx.req.user?.tenantId;
      return this.journalSvc.list(tenantId);
    }
  
    /** 仕訳 CSV (base64) */
    @Query(() => String)
    async journalCsv(@Context() ctx: any) {
      const tenantId: string = ctx.req.user?.tenantId;
      return this.journalSvc.exportCsv(tenantId);
    }
  
    /** 未仕訳 Tx から仕訳を生成し、生成件数を返す */
    @Mutation(() => Int)
    async generateJournal(@Context() ctx: any) {
      const tenantId: string = ctx.req.user?.tenantId;
      return this.journalSvc.generateForTenant(tenantId);
    }
  }
  
  /* ───────── GraphQL ObjectType ───────── */
  @ObjectType()
  class Journal {
    @Field(() => ID)    id!: string;
    @Field()            accountDr!: string;
    @Field()            accountCr!: string;
    @Field(() => Float) amountJpy!: number;
  
    /** freee 送信済みなら dealId を保持（未送信は null） */
    @Field(() => Int, { nullable: true })
    freeeDealId?: number | null;
  }
  