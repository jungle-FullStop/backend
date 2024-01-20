import { Injectable } from '@nestjs/common';
import { ChatHistoryManager } from './model/chat-history-manager';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import {
  GetChatCompletionAnswerInputDTO,
  GetChatCompletionAnswerOutputDTO,
} from './model/chat-completion-answer.dto';
// import { Repository } from 'typeorm';
// import { SearchHistory } from './entity/search-history.entity';
// import { InjectRepository } from '@nestjs/typeorm';
import { ChatCompletionApiRepository } from './chat-completion-api.repository';

const DEFAULT_TEMPERATURE = 1;
const DEFAULT_MODEL = 'gpt-3.5-turbo';

@Injectable()
export class ChatCompletionApiService {
  private readonly chatHistory: ChatHistoryManager;
  private readonly chat: ChatOpenAI;
  // private readonly chatCompletionApiRepository: ChatCompletionApiRepository;

  constructor(
    private readonly chatCompletionApiRepository: ChatCompletionApiRepository,
  ) {
    this.chatHistory = new ChatHistoryManager();
    this.chat = new ChatOpenAI({
      temperature: DEFAULT_TEMPERATURE,
      openAIApiKey: process.env.OPENAI_KEY,
      streaming: true,
      modelName: DEFAULT_MODEL,
    });
  }

  async getAiModelAnswer(data: GetChatCompletionAnswerInputDTO) {
    this.chatHistory.addHumanMessage(data.message);
    const result = await this.chat.predictMessages(
      this.chatHistory.chatHistory,
    );

    const aiMessage = result.content;

    this.chatHistory.addAiMessage(aiMessage);

    return GetChatCompletionAnswerOutputDTO.getInstance(aiMessage);
  }

  async getSearchHistoryByUserId(userId: string): Promise<string[]> {
    // console.log(userId, 'HERE!!!');
    const searchHistory =
      await this.chatCompletionApiRepository.getSearchHistoryByUserId(userId);

    // console.log(searchHistory, 'SERARCH!!!');
    return searchHistory;
  }
}
