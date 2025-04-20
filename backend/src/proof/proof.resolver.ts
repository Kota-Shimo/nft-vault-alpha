import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { ProofService } from './proof.service';
import { PrismaService } from '../prisma.service';

@Resolver()
export class ProofResolver {
  constructor(
    private readonly svc: ProofService,
    private readonly prisma: PrismaService,
  ) {}

  @Query(() => [Proof])
  proofs(@Args('tenantId') tenantId: string) {
    return this.svc.list(tenantId);
  }

  /* ★ Tx が 1 件も無い時でも null を返す */
  @Query(() => String, { nullable: true })
  async latestTxId(@Args('tenantId') tenantId: string) {
    const tx = await this.prisma.tx.findFirst({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
    return tx?.id ?? null;
  }

  @Mutation(() => Boolean)
  async generateProof(@Args('txId') txId: string) {
    await this.svc.createProof(txId);
    return true;
  }
}

import { ObjectType, Field, ID } from '@nestjs/graphql';
@ObjectType()
class Proof {
  @Field(() => ID) id!: string;
  @Field() txId!: string;
  @Field() celestiaHash!: string;
  @Field() pdfUrl!: string;
}
