import { Injectable } from '@nestjs/common';
import { ChatCompletionApiService } from '../chat-completion-api/chat-completion-api.service';
import { ExtensionHistoryDto } from './model/extension-history.dto';
import { HistoryRepository } from './history.repository';
import { ExtensionHistoryRecords } from './entity/extension-history-records.entity';

@Injectable()
export class HistoryService {
  constructor(
    private chatService: ChatCompletionApiService,
    private historyRepository: HistoryRepository,
  ) {}

  async handleExtensionHistory(dto: ExtensionHistoryDto): Promise<any> {
    const processData = await this.chatService.processExtenstionData(dto);
    const processTitle = this.preprocess(dto.title);

    const extensionHistoryRecord = this.historyRepository.create({
      userId: '3',
      visitedURL: dto.url,
      rawData: dto.title,
      processedTitle: processTitle,
      processedData: processData,
    });

    this.historyRepository.save(extensionHistoryRecord);
    return processData;
  }

  preprocess(tags: string): string {
    const res: string[] = [];
    // 특수기호 정규식
    const reg = /[`~!@#$%^&*()_|+\-=?;:'",<>\{\}\[\]\\\/]/gim;
    const preprocessTags: string[] = tags.replace(reg, '').split(' ');
    for (const preprocessTag of preprocessTags) {
      res.push(this.removeStopwords(preprocessTag));
    }
    return res.join(', ');
  }

  removeStopwords(word: string): string {
    // 한국어 불용어 리스트
    const stopwords = [
      '은',
      '는',
      '이',
      '가',
      '을',
      '를',
      '에',
      '와',
      '과',
      '의',
      '에서',
      '로',
      '든',
      '든지',
      '라도',
      '이나',
      '처럼',
      '만',
      '도',
      '마저',
      '부터',
      '까지',
      // 필요에 따라 더 추가할 수 있습니다.
    ];
    for (const stopword of stopwords) {
      if (word.endsWith(stopword)) {
        return word.slice(0, -stopword.length);
      }
    }
    return word;
  }

  async getSearchHistoryByUserId(userId: string): Promise<string[]> {
    const searchHistory = await this.historyRepository
      .createQueryBuilder('history')
      .where('history.userId = :userId', { userId })
      .select('history.processedData')
      .getMany();

    return searchHistory.map((history) => history.processedData);
  }

  async getHistory(): Promise<ExtensionHistoryRecords[]> {
    const return_data = this.historyRepository.find();

    return return_data;
  }
}
