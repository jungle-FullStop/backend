import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Mindmap } from './entity/mindmap.entity';

@Injectable()
export class MindmapRepository extends Repository<Mindmap> {
  constructor(private dataSource: DataSource) {
    super(Mindmap, dataSource.createEntityManager());
  }

  async findMindmap(userId: number): Promise<Mindmap> {
    const latestMindmap = await this.findOne({
      where: { userId },
      order: { timestamp: 'DESC' }, // timestamp를 기준으로 내림차순 정렬
    });
    return latestMindmap;
  }

  async saveMindmap(mindmap: string, fromDate: Date): Promise<Mindmap> {
    const mindmapRecord = this.create({
      userId: 1,
      data: mindmap,
      timestamp: fromDate,
    });
    this.save(mindmapRecord);
    return mindmapRecord;
  }
}
