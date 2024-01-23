import { Module, forwardRef } from '@nestjs/common';
import { HistoryController } from './history.controller';
import { HistoryService } from './history.service';
import { HistoryRepository } from './history.repository';
import { ChatCompletionApiModule } from '../chat-completion-api/chat-completion-api.module';
import { ExtensionHistoryRecords } from './entity/extension-history-records.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [forwardRef(() => ChatCompletionApiModule),
     TypeOrmModule.forFeature([ExtensionHistoryRecords])],
  controllers: [HistoryController],
  providers: [HistoryService, HistoryRepository],
  exports: [HistoryService],
})
export class HistoryModule {}
