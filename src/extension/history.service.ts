import { Injectable } from '@nestjs/common';
import { ChatCompletionApiService } from '../chat-completion-api/chat-completion-api.service';
import { ExtensionHistoryDto } from './model/extension-history.dto';
import { HistoryRepository } from './history.repository';
import { ExtensionHistoryRecords } from './entity/extension-history-records.entity';
import { addDays, startOfDay } from 'date-fns';

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
      userId: dto.userId,
      visitedURL: dto.url,
      rawData: dto.title,
      processedTitle: processTitle,
      processedData: processData,
    });

    this.historyRepository.save(extensionHistoryRecord);
    return processData;
  }

  preprocess(tags: string): string {
    const resSet = new Set();
    // 특수기호 정규식
    const reg = /[`.~!@#$%^&*()_|+\-=—?;:'",<>\{\}\[\]\\\/]/gim;
    const preprocessTags: string[] = tags.replace(reg, '').split(' ');
    for (const preprocessTag of preprocessTags) {
      resSet.add(this.removeStopwords(preprocessTag));
    }
    resSet.delete('');
    return Array.from(resSet.values()).join(', ');
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

  async getSearchHistoryByUserId(
    userId: number,
    fromDate: Date,
  ): Promise<string[]> {
    const offset = 1000 * 60 * 60 * 9;
    const koreaNow = new Date(new Date(fromDate).getTime() + offset);
    koreaNow.setUTCHours(0, 0, 0, 0);

    const dayDate = koreaNow.toISOString().replace('T', ' ').split('.')[0];

    const nextDayDate = addDays(koreaNow, 1)
      .toISOString()
      .replace('T', ' ')
      .split('.')[0]; // 다음 날 자

    const searchHistory = await this.historyRepository
      .createQueryBuilder('history')
      .where('history.userId = :userId', { userId })
      .andWhere(
        'history.timestamp >= :dayDate AND history.timestamp < :nextDayDate',
        { dayDate, nextDayDate },
      )
      .select('history.processedTitle')
      .getMany();

    // 2024-01-21 11:11:11
    // console.log('SERACH : ' + searchHistory);

    // 2024-01-21 11:11:11
    console.log('SERACH : ' + searchHistory);

    if (!searchHistory) {
      return null;
    }
    console.log(searchHistory);
    return searchHistory.map((history) => history.processedTitle);
  }

  async getHistory(): Promise<ExtensionHistoryRecords[]> {
    const return_data = this.historyRepository.find();

    return return_data;
  }
}
