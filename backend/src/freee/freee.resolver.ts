import { Resolver, Mutation, Args, Int } from '@nestjs/graphql';
import { FreeeService } from './freee.service';

@Resolver()
export class FreeeResolver {
  constructor(private readonly freee: FreeeService) {}

  /** 未送信 Journal を freee へ送信し、成功件数を返す */
  @Mutation(() => Int)
  async sendJournalToFreee(@Args('tenantId') tenantId: string) {
    return this.freee.sendJournals(tenantId);
  }

  /** 1円テスト送信（デバッグ用） */
  @Mutation(() => Boolean)
  async testFreeeSend() {
    return this.freee.sendJournal('dummy');
  }
}
