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
    const searchHistory = await this.historyservice.getSearchHistoryByUserId(
      userId,
      fromDate,
    );

    const nodes = [];
    const edges = [];
    const keywords = [];

    // 키워드 등장횟수 구하기
    const totalKeywords = searchHistory
      .map((keyword) => keyword.processedTitle)
      .join(', ')
      .toUpperCase()
      .split(', ');

    const TOTALKEYWORDS = totalKeywords.length;
    console.log(TOTALKEYWORDS);

    for (const i in totalKeywords) {
      const key = totalKeywords[i];
      keywords[key] =
        keywords[key] === undefined ? 1 : (keywords[key] = keywords[key] + 1);
    }

    const nodeKeywords = Object.fromEntries(
      Object.entries(keywords).filter(([, value]) => value >= 2),
    );
    console.log(nodeKeywords);

    // 노드 생성
    for (const j in nodeKeywords) {
      nodes.push({
        data: {
          id: j,
          label: j,
        },
      });
    }

    // 엣지 생성
    for (const historyID in searchHistory) {
      const history = searchHistory[historyID];
      for (const first in nodeKeywords) {
        for (const second in nodeKeywords) {
          if (first === second) continue;
          const source = history.processedTitle.toLowerCase();
          if (
            source.includes(first.toLowerCase()) &&
            source.includes(second.toLowerCase())
          ) {
            edges.push({
              data: {
                source: first,
                target: second,
              },
            });
          }
        }
      }
    }

    const mindmap = {
      nodes: nodes,
      edges: edges,
    };

    return await this.mindmapRepository.saveMindmap(
      JSON.stringify(mindmap),
      fromDate,
    );
  }
}
