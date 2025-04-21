import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JournalService } from './journal.service';
import { JournalResolver } from './journal.resolver';

/**
 * JournalModule
 * PrismaService を DI し、Service / Resolver を提供
 */
@Module({
  providers: [PrismaService, JournalService, JournalResolver],
  exports: [JournalService],
})
export class JournalModule {}
