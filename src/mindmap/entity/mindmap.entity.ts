import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity() // 테이블 이름
export class Mindmap {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column('text')
  data: string;
  // data: NodeDataDefinition | EdgeDataDefinition;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date; // 생성된 날짜
}
