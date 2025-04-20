/* backend/src/app.module.ts */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { ScheduleModule } from '@nestjs/schedule';

import { PrismaService } from './prisma.service';

/* ── Feature Modules ───────────────────────── */
import { AuthModule }    from './modules/auth/auth.module';
import { NftModule }     from './modules/nft/nft.module';
import { JournalModule } from './journal/journal.module';
import { ProofModule }   from './proof/proof.module';
import { BillingModule } from './billing/billing.module';
import { SyncModule }    from './sync/sync.module';
import { FreeeModule }   from './freee/freee.module';

/* ── Blockchain Services ───────────────────── */
import { AggregatorService } from './modules/blockchain/aggregator.service';
import { AnchoringService }  from './modules/blockchain/anchoring.service';
import { EvmService }        from './modules/blockchain/evm.service';
import { AptosService }      from './modules/blockchain/aptos.service';

/* ── Resolvers & Jobs ──────────────────────── */
import { TxResolver }      from './tx/tx.resolver';
import { FreeeResolver }   from './freee/freee.resolver';   // ★ 追加
import { FreeeService }    from './freee/freee.service';    // ★ 追加
import { JournalSyncJob }  from './journal/journal.sync';   // ★ 追加

@Module({
  imports: [
    /* 環境変数を全モジュールで共有 */
    ConfigModule.forRoot({ isGlobal: true }),

    /* Cron ジョブ用 */
    ScheduleModule.forRoot(),

    /* GraphQL 設定 */
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: true,
      context: ({ req }) => ({ req }),
      bodyParserConfig: { limit: '20mb' },
    }),

    /* ドメインモジュール */
    AuthModule,
    NftModule,
    JournalModule,
    ProofModule,
    BillingModule,
    SyncModule,
    FreeeModule,
  ],

  providers: [
    PrismaService,

    /* Blockchain Services */
    AggregatorService,
    AnchoringService,
    EvmService,
    AptosService,

    /* Resolvers */
    TxResolver,
    FreeeResolver,     // ★ 追加

    /* Services & Cron Jobs */
    FreeeService,      // ★ 追加
    JournalSyncJob,    // ★ 追加
  ],
})
export class AppModule {}
