/* backend/src/proof/proof.resolver.ts
   ─────────────────────────────────── */
import { Resolver, Query, Mutation, Args, Context, ObjectType, Field, ID } from '@nestjs/graphql';
import { ProofService }  from './proof.service';
import { PrismaService } from '../prisma.service';

@Resolver()
export class ProofResolver {
  constructor(
    private readonly svc   : ProofService,
    private readonly prisma: PrismaService,
  ) {}

  /** Proof 一覧 */
  @Query(() => [Proof])
  proofs(@Context() ctx: any) {
    const tenantId: string = ctx.req.user?.tenantId;
    return this.svc.list(tenantId);
  }

  /** 最新 TxId を返す（Tx が無ければ null） */
  @Query(() => String, { nullable: true })
  async latestTxId(@Context() ctx: any) {
    const tenantId: string = ctx.req.user?.tenantId;
    const tx = await this.prisma.tx.findFirst({
      where  : { tenantId },
      orderBy: { createdAt: 'desc' },
    });
    return tx?.id ?? null;
  }

  /** Proof 生成 */
  @Mutation(() => Boolean)
  async generateProof(@Args('txId') txId: string) {
    await this.svc.createProof(txId);
    return true;
  }
}

/* ───────── GraphQL ObjectType ───────── */
@ObjectType()
class Proof {
  @Field(() => ID) id!: string;
  @Field() txId!: string;
  @Field() celestiaHash!: string;
  @Field() pdfUrl!: string;
}
