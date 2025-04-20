import { Module } from '@nestjs/common';
import { ProofService } from './proof.service';
import { ProofResolver } from './proof.resolver';
import { ProofController } from './proof.controller';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [PrismaService, ProofService, ProofResolver],
  controllers: [ProofController],
})
export class ProofModule {}
