import { Module, forwardRef } from '@nestjs/common';
import { ChatCompletionApiService } from './chat-completion-api.service';
import { ChatCompletionApiController } from './chat-completion-api.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchHistory } from './entity/search-history.entity';
import { HistoryModule } from 'src/extension/history.module';
import { HistoryRepository } from 'src/extension/history.repository';

@Module({
  // imports: [TypeOrmModule.forFeature([SearchHistory])],
  imports: [forwardRef(() =>HistoryModule)],
  providers: [ChatCompletionApiService, HistoryRepository],
  controllers: [ChatCompletionApiController],
  exports: [ChatCompletionApiService],
})
export class ChatCompletionApiModule {}
