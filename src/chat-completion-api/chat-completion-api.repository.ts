import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { SearchHistory } from './entity/search-history.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ChatCompletionApiRepository {
  constructor(
    @InjectRepository(SearchHistory)
    private searchHistoryRepository: Repository<SearchHistory>,
  ) {}

  async getSearchHistoryByUserId(userId: string): Promise<string[]> {
    const searchHistory = await this.searchHistoryRepository
      .createQueryBuilder('history')
      .where('history.userId = :userId', { userId })
      .select('history.searchTerm')
      .getMany();

    return searchHistory.map((history) => history.searchTerm);
  }
}
