import { Module } from '@nestjs/common';
import { FreeeService }   from './freee.service';
import { JournalSyncJob } from '../journal/journal.sync';

@Module({
  providers: [FreeeService, JournalSyncJob],
  exports:   [FreeeService],       // 他モジュールでも使えるように export
})
export class FreeeModule {}
