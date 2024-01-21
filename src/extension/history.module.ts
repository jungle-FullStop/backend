import { Module } from '@nestjs/common';
import { HistoryController } from './history.controller';
import { HistoryService } from './history.service';
import { HistoryRepository } from './history.repository';
import { ChatCompletionApiModule } from '../chat-completion-api/chat-completion-api.module';

@Module({
  imports: [ChatCompletionApiModule],
  controllers: [HistoryController],
  providers: [HistoryService, HistoryRepository],
  exports: [HistoryService],
})
export class HistoryModule {}
