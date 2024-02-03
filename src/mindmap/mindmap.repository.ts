import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Mindmap } from './entity/mindmap.entity';

@Injectable()
export class MindmapRepository extends Repository<Mindmap> {
  constructor(private dataSource: DataSource) {
    super(Mindmap, dataSource.createEntityManager());
  }

  async findMindmap(userId: number): Promise<Mindmap> {
    return await this.findOne({
      where: { userId },
      order: { timestamp: 'DESC' }, // timestamp를 기준으로 내림차순 정렬
    });
  }

  async saveMindmap(
    userId: number,
    mindmap: string,
    fromDate: Date,
  ): Promise<Mindmap> {
    const mindmapRecord = this.create({
      userId: userId,
      data: mindmap,
      timestamp: fromDate,
    });
    await this.save(mindmapRecord);
    return mindmapRecord;
  }
}
