import {
  Body,
  Controller,
  Post,
  ValidationPipe,
  Get,
  Param,
} from '@nestjs/common';
import { ChatCompletionApiService } from './chat-completion-api.service';
import { GetChatCompletionAnswerInputDTO } from './model/chat-completion-answer.dto';
import { HistoryService } from 'src/extension/history.service';

@Controller('chat-completion-api')
export class ChatCompletionApiController {
  constructor(private readonly chatservice: ChatCompletionApiService,
              private readonly historyservice: HistoryService) {}

  @Get('/:userId')
  async getChatCompletionMessage(@Param('userId') userId: string) {
    // 여기서 userId를 사용하여 DB에서 해당 사용자의 검색 기록을 가져온다고 가정
    const searchHistory = await this.historyservice.getSearchHistoryByUserId(userId);

    // 검색 기록을 string 형태로 변환하여 GetChatCompletionAnswerInputDTO에 담기
    const data: GetChatCompletionAnswerInputDTO = {
      message: searchHistory.join(' '), // 예시: 검색 기록을 공백으로 구분한 문자열로 변환
    };

    // 결과 반환
    return this.chatservice.getReport(data);
  }
}
