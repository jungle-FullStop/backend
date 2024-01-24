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
import { ExtensionHistoryDto } from '../extension/model/extension-history.dto';
import { CreateReportDto } from 'src/report/dto/create-report.dto';

const DEFAULT_TEMPERATURE = 1;
const DEFAULT_MODEL = 'gpt-3.5-turbo-1106';

@Injectable()
export class ChatCompletionApiService {
  private readonly chatHistory: ChatHistoryManager;
  private readonly chat: ChatOpenAI;

  // private readonly chatCompletionApiRepository: ChatCompletionApiRepository;

  constructor(
    // private readonly chatCompletionApiRepository: ChatCompletionApiRepository,
  ) {
    this.chatHistory = new ChatHistoryManager();
    this.chat = new ChatOpenAI({
      temperature: DEFAULT_TEMPERATURE,
      openAIApiKey: process.env.OPENAI_KEY,
      streaming: false,
      modelName: DEFAULT_MODEL,
    });
  }


  // const prompt = this.createKeywordPrompt(dto.title, dto.tag);

  //   this.chatHistory.addHumanMessage(prompt);
  //   const result = await this.chat.predictMessages(
  //     this.chatHistory.chatHistory,
  //   );

  async getReport(data: CreateReportDto) {
    const prompt = this.createReportPrompt(data.message);
    this.chatHistory.addHumanMessage(prompt);
    const result = await this.chat.predictMessages(
      this.chatHistory.chatHistory,
    );

    const aiMessage = result.content;

    this.chatHistory.addAiMessage(aiMessage);

    return GetChatCompletionAnswerOutputDTO.getInstance(aiMessage);
  }

  // async getSearchHistoryByUserId(userId: string): Promise<string[]> {
  //   // console.log(userId, 'HERE!!!');
  //   const searchHistory =
  //     await this.chatCompletionApiRepository.getSearchHistoryByUserId(userId);

  //   // console.log(searchHistory, 'SERARCH!!!');
  //   return searchHistory;
  // }

  async processExtenstionData(dto: ExtensionHistoryDto): Promise<string> {
    const prompt = this.createKeywordPrompt(dto.title, dto.tag);

    this.chatHistory.addHumanMessage(prompt);
    const result = await this.chat.predictMessages(
      this.chatHistory.chatHistory,
    );

    const aiMessage = result.content;

    this.chatHistory.addAiMessage(aiMessage);
    
    // console.log(aiMessage);
    return aiMessage;
  }

  private createKeywordPrompt(title: string, tags: string[]): string {
    // 프롬프트를 생성하는 로직을 구현합니다.
    // 예를 들어, title과 tags를 결합하여 프롬프트를 만듭니다.
    // `주제: ${title}\n관련 키워드: ${tags.join(', ')}\n\n위 주제와 관련된 기술 스택과 기술 용어를 나열해주세요.`;

    return `${title}와 ${tags}에서 개발과 관련된 중요한 키워드만 ','를 기준으로 나열해주세요`;
  }

  private createReportPrompt(keyword: string): string {
    // 프롬프트를 생성하는 로직을 구현합니다.
    // 예를 들어, title과 tags를 결합하여 프롬프트를 만듭니다.
    // `주제: ${title}\n관련 키워드: ${tags.join(', ')}\n\n위 주제와 관련된 기술 스택과 기술 용어를 나열해주세요.`;
    console.log(keyword);
    return `제가 하루동안 검색한 ${keyword}를 바탕으로 개발과 관련된 글을 작성하려고 합니다. 적절한 제목을 선정하여 글의 양식만 예시와 같이 작성해주세요. 글의 마지막에는 한줄 뛰고 기울임 글씨체로 명언 문구만 넣어주세요.
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
