import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';   // ← 同じフォルダなので ./

@Global()
@Module({
  providers: [PrismaService],
  exports:   [PrismaService],
})
export class PrismaModule {}
