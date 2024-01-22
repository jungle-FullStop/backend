import { Module } from '@nestjs/common';
import { ChatCompletionApiService } from './chat-completion-api.service';
import { ChatCompletionApiController } from './chat-completion-api.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchHistory } from './entity/search-history.entity';
import { ChatCompletionApiRepository } from './chat-completion-api.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SearchHistory])],
  providers: [ChatCompletionApiService, ChatCompletionApiRepository],
  controllers: [ChatCompletionApiController],
  exports: [ChatCompletionApiService],
})
export class ChatCompletionApiModule {}
