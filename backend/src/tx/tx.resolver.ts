import { Query, Resolver } from '@nestjs/graphql';
import { PrismaService }   from '../prisma.service';
import { Prisma } from '@prisma/client';

@Resolver()
export class TxResolver {
  constructor(private readonly prisma: PrismaService) {}

  /** 総残高 (JPY) を返す Aggregate */
  @Query(() => Number, { name: 'totalBalanceJpy' })
  async totalBalanceJpy(): Promise<number> {
    const agg = await this.prisma.tx.aggregate({
      _sum: { amountJpy: true },
    }); // agg の型は Prisma.AggregateTx

    return (agg as Prisma.AggregateTx)._sum?.amountJpy ?? 0;
  }
}
