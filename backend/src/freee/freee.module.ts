import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { FreeeService } from './freee.service';
import { FreeeResolver } from './freee.resolver';

@Module({
  providers: [PrismaService, FreeeService, FreeeResolver],
  exports: [FreeeService],
})
export class FreeeModule {}
