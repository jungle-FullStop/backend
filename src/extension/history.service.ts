import { Injectable } from '@nestjs/common';
import { ChatCompletionApiService } from '../chat-completion-api/chat-completion-api.service';
import { ExtensionHistoryDto } from './model/extension-history.dto';
import { HistoryRepository } from './history.repository';
import { ExtensionHistoryRecords } from './entity/extension-history-records.entity';
import { stopwords } from './utils/stopwords';
import { addDays } from 'date-fns';
import { SearchHistroyResponseDto } from './dto/history.dto';

@Injectable()
export class HistoryService {
  constructor(
    private chatService: ChatCompletionApiService,
    private historyRepository: HistoryRepository,
  ) {}

  async handleExtensionHistory(dto: ExtensionHistoryDto): Promise<any> {
    const { dayDate, nextDayDate } = this.getKoreaTime(new Date());
    // 중복 데이터가 있으면 제거
    const checkDup = await this.historyRepository
      .createQueryBuilder('history')
      .where('history.userId = :userId', { userId: dto.userId })
      .andWhere('history.visitedURL = :url', { url: dto.url })
      .andWhere(
        'history.timestamp >= :dayDate AND history.timestamp < :nextDayDate',
        { dayDate, nextDayDate },
      )
      .getOne();
    if (checkDup) {
      return;
    }

    const aiData = await this.chatService.processExtenstionData(dto);
    const processTitle = this.preprocess(dto.title);
    const processData = this.removeSybols(aiData);
    await this.historyRepository.save({
      userId: dto.userId,
      visitedURL: dto.url,
      thumbnail: dto.thumbnail,
      rawData: dto.title,
      description: dto.description,
      processedTitle: processTitle,
      processedData: processData,
    });
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
    return word
      .replace(middleReg, ' ')
      .replace(endReg, '')
      .replace(/[0-9]/g, '');
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

  private getKoreaTime(fromDate: Date) {
    const offset = 1000 * 60 * 60 * 9;
    const koreaNow = new Date(new Date(fromDate).getTime() + offset);
    koreaNow.setUTCHours(0, 0, 0, 0);

    const dayDate = koreaNow.toISOString().replace('T', ' ').split('.')[0];

    const nextDayDate = addDays(koreaNow, 1)
      .toISOString()
      .replace('T', ' ')
      .split('.')[0];

    return { dayDate, nextDayDate };
  }

  async getSearchHistoryByUserId(
    userId: number,
    fromDate: Date,
  ): Promise<ExtensionHistoryRecords[]> {
    const { dayDate, nextDayDate } = this.getKoreaTime(fromDate);

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
    return this.historyRepository.find();
  }

  async getHistoryById(userId: number) {
    const records = await this.historyRepository.findById(userId);

    const res: SearchHistroyResponseDto[] = records.map((record) => {
      return {
        id: record.id,
        rawData: record.rawData,
        description: record.description,
        visitedURL: record.visitedURL,
        thumbnail: record.thumbnail,
        createdAt: record.timestamp,
      };
    });
    // 최근 10개만 반환
    return res.slice(0, 10);
  }

  async searchHistory(
    userId: number,
    keyword: string,
  ): Promise<SearchHistroyResponseDto[]> {
    const records = await this.getHistoryById(userId);
    return records.filter((record) =>
      record.rawData.toLowerCase().includes(keyword.toLowerCase()),
    );
  }
}
