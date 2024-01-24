import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity() // 테이블 이름
export class ExtensionHistoryRecords {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string; // 사용자 ID

  @Column()
  visitedURL: string; // 방문한 URL

  @Column('text')
  rawData: string; // 가공 전 데이터

  @Column('text')
  processedData: string; // 가공 후 데이터

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date; // 생성된 날짜
}

