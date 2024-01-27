import { Injectable } from '@nestjs/common';
import { ChatCompletionApiService } from '../chat-completion-api/chat-completion-api.service';
import { ExtensionHistoryDto } from './model/extension-history.dto';
import { HistoryRepository } from './history.repository';
import { ExtensionHistoryRecords } from './entity/extension-history-records.entity';
import { stopwords } from './utils/stopwords';
import { addDays } from 'date-fns';

@Injectable()
export class HistoryService {
  constructor(
    private chatService: ChatCompletionApiService,
    private historyRepository: HistoryRepository,
  ) {}

  async handleExtensionHistory(dto: ExtensionHistoryDto): Promise<any> {
    const aiData = await this.chatService.processExtenstionData(dto);
    const processTitle = this.preprocess(dto.title);
    const processData = this.removeSybols(aiData);

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
    // 특수기호 제거
    const preprocessTags = this.removeSybols(tags).split(' ');
    // 불용어 제거
    for (const preprocessTag of preprocessTags) {
      resSet.add(this.removeStopwords(preprocessTag));
    }
    resSet.delete('');
    return Array.from(resSet.values()).join(', ');
  }

  removeSybols(word: string): string {
    // 특수기호 정규식
    const middleReg = /[`@#$%^&*()_|+\-=—;:'",<>\{\}\[\]\\\/]/gim;
    const endReg = /[`.~!?]/gim;
    const preprocess: string = word
      .replace(middleReg, ' ')
      .replace(endReg, '')
      .replace(/[0-9]/g, '');
    return preprocess;
  }

  removeStopwords(word: string): string {
    // 한국어 불용어 리스트
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
  ): Promise<ExtensionHistoryRecords[]> {
    const offset = 1000 * 60 * 60 * 9;
    const koreaNow = new Date(new Date(fromDate).getTime() + offset);
    koreaNow.setUTCHours(0, 0, 0, 0);

    const dayDate = koreaNow.toISOString().replace('T', ' ').split('.')[0];

    const nextDayDate = addDays(koreaNow, 1)
      .toISOString()
      .replace('T', ' ')
      .split('.')[0];

    const searchHistory = await this.historyRepository
      .createQueryBuilder('history')
      .where('history.userId = :userId', { userId })
      .andWhere(
        'history.timestamp >= :dayDate AND history.timestamp < :nextDayDate',
        { dayDate, nextDayDate },
      )
      .getMany();

    if (!searchHistory) {
      return null;
    }
    return searchHistory;
  }

  async getHistory(): Promise<ExtensionHistoryRecords[]> {
    const return_data = this.historyRepository.find();

    return return_data;
  }
}
