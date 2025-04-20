import { Injectable, INestApplication, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}

/* 
  これは “旧コードが import '../../prisma.service' ” と書いてある
  パス互換用のダミーです。
  src/prisma/prisma.service.ts と内容は同じで OK。
*/
