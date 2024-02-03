import { Injectable } from '@nestjs/common';
import { ChatHistoryManager } from './model/chat-history-manager';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { GetChatCompletionAnswerOutputDTO } from './model/chat-completion-answer.dto';
// import { Repository } from 'typeorm';
// import { SearchHistory } from './entity/search-history.entity';
// import { InjectRepository } from '@nestjs/typeorm';
import { ExtensionHistoryDto } from '../extension/model/extension-history.dto';
import { CreateReportDto } from 'src/report/dto/create-report.dto';

const DEFAULT_TEMPERATURE = 0.5;
const DEFAULT_MODEL = 'gpt-3.5-turbo-1106';

@Injectable()
export class ChatCompletionApiService {
  // private readonly chatManager: ChatHistoryManager;
  private readonly chat: ChatOpenAI;

  constructor() {
    // this.chatManager = new ChatHistoryManager('한국말로만 대답해주세요');
    this.chat = new ChatOpenAI({
      temperature: DEFAULT_TEMPERATURE,
      openAIApiKey: process.env.OPENAI_KEY,
      streaming: false,
      modelName: DEFAULT_MODEL,
    });
  }

  async getReport(data: CreateReportDto) {
    const chatManager = new ChatHistoryManager('한국말로만 대답해주세요');

    const prompt = this.createReportPrompt(data.message);
    chatManager.addHumanMessage(prompt);
    const result = await this.chat.predictMessages(chatManager.chatHistory);

    const aiMessage = result.content;

    chatManager.addAiMessage(aiMessage);
    return GetChatCompletionAnswerOutputDTO.getInstance(aiMessage);
  }

  async processExtenstionData(dto: ExtensionHistoryDto): Promise<string> {
    const chatManager = new ChatHistoryManager();
    const prompt = this.createKeywordPrompt(dto.title, dto.tag);

    chatManager.addHumanMessage(prompt);
    const result = await this.chat.predictMessages(chatManager.chatHistory);

    const aiMessage = result.content;

    chatManager.addAiMessage(aiMessage);
    return aiMessage;
  }

  private createKeywordPrompt(title: string, tags: string[]): string {
    return `${title}와 ${tags}에서 개발과 관련된 중요한 키워드만 ','를 기준으로 나열해주세요`;
  }

  private createReportPrompt(keyword: string): string {
    return `제가 하루동안 검색한 ${keyword}를 바탕으로 개발과 관련된 글을 작성하려고 합니다. 적절한 제목을 선정하여 글의 형식을 예시와 같이 작성해주세요. 글의 마지막에는 한줄 뛰고 기울임 글씨체로 명언 문구만 넣어주세요.
    예시:
    ### 1. Emmet 소개
    - OAuth 프로토콜 흐름
    - 액세스 토큰을 재발행하는 흐름
    - 구글 OAuth를 사용하기 위한 준비하기
    ### 2. React.js 개요
    - React.js의 개념과 특징
    - React.js와 Vue, Angular의 비교
    - Virtual-dom과 JSX 설명`;
  }
}
