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
import { ExtensionHistoryDto } from '../extension/model/extension-history.dto';

const DEFAULT_TEMPERATURE = 1;
const DEFAULT_MODEL = 'gpt-3.5-turbo-1106';

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
      streaming: false,
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

  async processExtenstionData(dto: ExtensionHistoryDto): Promise<string> {
    const prompt = this.createPrompt(dto.title, dto.tag);

    this.chatHistory.addHumanMessage(prompt);
    const result = await this.chat.predictMessages(
      this.chatHistory.chatHistory,
    );

    const aiMessage = result.content;

    this.chatHistory.addAiMessage(aiMessage);

    return aiMessage;
  }

  private createPrompt(title: string, tags: string[]): string {
    // 프롬프트를 생성하는 로직을 구현합니다.
    // 예를 들어, title과 tags를 결합하여 프롬프트를 만듭니다.
    return `주제: ${title}\n관련 키워드: ${tags.join(', ')}\n\n위 주제와 관련된 기술 스택과 기술 용어를 나열해주세요.`;
  }
}
