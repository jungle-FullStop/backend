import { Module, forwardRef } from '@nestjs/common';
import { ChatCompletionApiService } from './chat-completion-api.service';
import { HistoryModule } from 'src/extension/history.module';
import { HistoryRepository } from 'src/extension/history.repository';

@Module({
  // imports: [TypeOrmModule.forFeature([SearchHistory])],
  imports: [forwardRef(() => HistoryModule)],
  providers: [ChatCompletionApiService, HistoryRepository],
  // controllers: [ChatCompletionApiController],
  controllers: [],
  exports: [ChatCompletionApiService],
})
export class ChatCompletionApiModule {}
