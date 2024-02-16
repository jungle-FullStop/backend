import { Injectable } from '@nestjs/common';
import { MindmapRepository } from './mindmap.repository';
import { HistoryService } from 'src/extension/history.service';
import { Mindmap } from './entity/mindmap.entity';
import { exceptKeyword } from './utils/exceptKeyword';

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
    const relations = [];
    const TOTALHISTORY = searchHistory.length;

    // 키워드 전처리
    const processedTitle = searchHistory
      .map((keyword) => keyword.processedTitle)
      .join(', ')
      .toUpperCase()
      .split(', ');

    let totalKeywords = [...processedTitle];
    totalKeywords = totalKeywords.filter((ele) => !exceptKeyword.includes(ele));
    // const TOTALCNT = totalKeywords.length;

    // 키워드 등장 횟수 계산
    for (const key of totalKeywords) {
      keywords[key] =
        keywords[key] === undefined ? 1 : (keywords[key] = keywords[key] + 1);
    }

    // 등장 횟수가 n개 이상인 것만 필터
    const nodeKeywords = Object.fromEntries(
      Object.entries(keywords)
        .filter(([, value]) => value >= 2)
        .sort(([, a], [, b]) => b - a),
    );

    // 노드 생성
    for (const node in nodeKeywords) {
      nodes.push({
        data: {
          id: node,
          label: node,
          cnt: nodeKeywords[node],
        },
      });
    }

    // 노드 키워드로 조합 계산
    const combination: string[][] = this.getCombination(
      Object.keys(nodeKeywords),
      2,
    );

    // 동시 등장 횟수 계산
    for (const historyID in searchHistory) {
      const history = searchHistory[historyID];
      for (const combi of combination) {
        const target: string = combi[0];
        const source: string = combi[1];
        if (target === source) continue;
        const sourceHistory = history.processedTitle.toLowerCase();
        // 키워드가 둘 다 포함되어 있으면 카운트
        if (
          sourceHistory.includes(target.toLowerCase()) &&
          sourceHistory.includes(source.toLowerCase())
        ) {
          const key = source + '-' + target;
          relations[key] =
            relations[key] === undefined
              ? 1
              : (relations[key] = relations[key] + 1);
        }
      }
    }

    // 등장 횟수가 n개 이상인 것만 필터
    const edgeKeywords = Object.fromEntries(
      Object.entries(relations).filter(([, value]) => value >= 2),
    );

    // 코사인 유사도 계산식
    const cosineSimilarity = (relation: string, items: string[]) => {
      const px = nodeKeywords[items[0]] / TOTALHISTORY;
      const py = nodeKeywords[items[1]] / TOTALHISTORY;
      const pxy = edgeKeywords[relation] / TOTALHISTORY;
      return ((pxy / (Math.sqrt(px) * Math.sqrt(py))) * 100).toPrecision(4);
    };

    // 엣지 생성
    for (const edge in edgeKeywords) {
      const items = edge.split('-');
      edges.push({
        data: {
          id: edge,
          source: items[0],
          target: items[1],
          cnt: cosineSimilarity(edge, items),
        },
      });
    }

    // mindmap으로 변환
    const mindmap = {
      nodes: nodes,
      edges: edges,
    };

    // DB에 저장
    return await this.mindmapRepository.saveMindmap(
      userId,
      JSON.stringify(mindmap),
      fromDate,
    );
  }

  // 조합 계산 함수
  getCombination = function (arr: string[], selectNumber: number): string[][] {
    const results = [];
    if (selectNumber === 1) return arr.map((value) => [value]); // 1개씩 택할 때, 바로 모든 배열의 원소 return

    arr.forEach((fixed, index, origin) => {
      const rest = origin.slice(index + 1); // 해당하는 fixed를 제외한 나머지 뒤
      const combinations = this.getCombination(rest, selectNumber - 1); // 나머지에 대해서 조합을 구한다.
      const attached = combinations.map((combination: string[]) => [
        fixed,
        ...combination,
      ]); //  돌아온 조합에 떼 놓은(fixed) 값 붙이기
      results.push(...attached); // 배열 spread syntax 로 모두다 push
    });

    return results; // 결과 담긴 results return
  };
}
