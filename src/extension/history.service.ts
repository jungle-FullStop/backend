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

    const extensionHistoryRecord = this.historyRepository.create({
      userId: '3',
      visitedURL: dto.url,
      rawData: dto.title,
      processedData: processData,
    });

    this.historyRepository.save(extensionHistoryRecord);
    return processData;
  }

  async getSearchHistoryByUserId(userId: string, fromDate: Date): Promise<string[]> {
    const dayDate = startOfDay(fromDate);
    const nextDayDate = startOfDay(addDays(fromDate, 1)); // 다음 날 자정
    const searchHistory = await this.historyRepository
      .createQueryBuilder('history')
      .where('history.userId = :userId', { userId })
      .andWhere('history.timestamp >= :dayDate AND history.timestamp < :nextDayDate', { dayDate, nextDayDate })
      .select('history.processedData')
      .getMany();

    if (!searchHistory) {
      return null;
    }
    return searchHistory.map((history) => history.processedData);
  }

  async getHistory(): Promise<ExtensionHistoryRecords[]> {
    const return_data = this.historyRepository.find();

    return return_data;
  }
}
