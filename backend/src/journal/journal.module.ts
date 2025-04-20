import { Module } from '@nestjs/common';
import { JournalService } from './journal.service';
import { JournalResolver } from './journal.resolver';
import { PrismaService } from '../prisma.service';   // ← ここがポイント

@Module({
  providers: [PrismaService, JournalService, JournalResolver],
})
export class JournalModule {}
