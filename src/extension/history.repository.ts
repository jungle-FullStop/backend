import { DataSource, Repository } from 'typeorm';
import { ExtensionHistoryRecords } from './entity/extension-history-records.entity';
import { Injectable } from '@nestjs/common';
import { User } from '../users/entity/user.entity';

@Injectable()
export class HistoryRepository extends Repository<ExtensionHistoryRecords> {
  constructor(private dataSource: DataSource) {
    super(ExtensionHistoryRecords, dataSource.createEntityManager());
  }

  async findById(userId: number) {
    return await this.createQueryBuilder('history')
      .where('history.userId = :userId', { userId })
      .getMany();
  }
}
