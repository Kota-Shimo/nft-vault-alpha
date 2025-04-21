/* -------------  backend/src/app.module.ts ------------- */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

import { PrismaService } from './prisma.service';

/* Feature Modules */
import { AuthModule }    from './modules/auth/auth.module';
import { NftModule }     from './modules/nft/nft.module';
import { JournalModule } from './journal/journal.module';
import { ProofModule }   from './proof/proof.module';
import { BillingModule } from './billing/billing.module';
import { SyncModule }    from './sync/sync.module';
import { FreeeModule }   from './freee/freee.module';

/* Blockchain Services */
import { AggregatorService } from './modules/blockchain/aggregator.service';
import { AnchoringService }  from './modules/blockchain/anchoring.service';
import { EvmService }        from './modules/blockchain/evm.service';
import { AptosService }      from './modules/blockchain/aptos.service';

/* Root‑level Resolver & Job */
import { TxResolver }     from './tx/tx.resolver';
import { JournalSyncJob } from './journal/journal.sync';

/* Multi‑tenant Guard / Interceptor */
import { TenantGuardV2 }       from './guards/tenant.guard';
import { TenantInterceptor } from './interceptors/tenant.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),

    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: true,
      /* tenantId を Context に流す */
      context: ({ req }) => ({
        req,
        tenantId: (req as any).user?.tenantId ?? null,
      }),
      bodyParserConfig: { limit: '20mb' },
    }),

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

    AggregatorService,
    AnchoringService,
    EvmService,
    AptosService,

    TxResolver,
    JournalSyncJob,

    /* ★ ここで全ルートに適用 */
    //{ provide: APP_GUARD,      useClass: TenantGuardV2 },
    { provide: APP_INTERCEPTOR,useClass: TenantInterceptor },
  ],
})
export class AppModule {}
