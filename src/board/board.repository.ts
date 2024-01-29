import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Board } from './entity/board.entity';

@Injectable()
export class BoardRepository extends Repository<Board> {
  constructor(private dataSource: DataSource) {
    super(Board, dataSource.createEntityManager());
  }

  async findAll(): Promise<Board[]> {
    return await this.find();
  }

  async findByID(userId: number): Promise<Board[]> {
    return await this.find({
      where: { userId },
      order: { timestamp: 'DESC' }, // timestamp를 기준으로 내림차순 정렬
    });
  }

  async saveBoard(
    userId: number,
    board: string,
    fromDate: Date,
  ): Promise<Board> {
    const boardRecord = this.create({
      userId: userId,
      contents: board,
      timestamp: fromDate,
    });
    await this.save(boardRecord);
    return boardRecord;
  }

  async updateBoard(
    userId: number,
    boardId: number,
    board: string,
  ): Promise<Board> {
    const boardRecord = await this.findOne({
      where: { userId, id: boardId },
      order: { timestamp: 'DESC' }, // timestamp를 기준으로 내림차순 정렬
    });
    boardRecord.contents = board;
    await this.save(boardRecord);
    return boardRecord;
  }

  async deleteBoard(userId: number, boardId: number): Promise<Board> {
    const boardRecord = await this.findOne({
      where: { userId, id: boardId },
      order: { timestamp: 'DESC' }, // timestamp를 기준으로 내림차순 정렬
    });
    await this.delete(boardRecord);
    return boardRecord;
  }
}
