import { Injectable } from '@nestjs/common';
import { MindmapRepository } from './mindmap.repository';
import { HistoryService } from 'src/extension/history.service';
import { Mindmap } from './entity/mindmap.entity';

@Injectable()
export class MindmapService {
  constructor(
    private readonly mindmapRepository: MindmapRepository,
    private readonly historyservice: HistoryService,
  ) {}

  async findMindmap(userId: number): Promise<Mindmap> {
    return await this.mindmapRepository.findMindmap(userId);
  }

  async createMindmap(userId: number, fromDate: Date): Promise<Mindmap> {
    const nodes = await this.findNodeById(userId, fromDate);
    const mindmap = nodes.join(', ');
    return await this.mindmapRepository.saveMindmap(mindmap, fromDate);
  }

  async findNodeById(userId: number, fromDate: Date): Promise<string[]> {
    const searchHistory = await this.historyservice.getSearchHistoryByUserId(
      userId,
      fromDate,
    );
    return searchHistory;
  }
}
