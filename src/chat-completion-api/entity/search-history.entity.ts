import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class SearchHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column()
  searchTerm: string;
}