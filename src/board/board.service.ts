import { BoardRepository } from './board.repository';
import { Injectable } from '@nestjs/common';
import { Board } from './entity/board.entity';
import { addDays } from 'date-fns';

@Injectable()
export class BoardService {
  constructor(private boardRepository: BoardRepository) {}

  async createBoard(userId: number, contents: string) {
    await this.boardRepository.save({
      userId: userId,
      contents: contents,
      timestamp: new Date(),
    });
  }

  async findAll(): Promise<Board[]> {
    return await this.boardRepository.find();
  }

  async findById(userId: number): Promise<Board[]> {
    return await this.boardRepository.find({
      where: { userId: userId },
    });
  }

  async findByDate(userId: number, date: Date): Promise<Board> {
    const startDate = new Date(date)
      .toISOString()
      .replace('T', ' ')
      .split('.')[0];
    const endDate = addDays(new Date(date), 1)
      .toISOString()
      .replace('T', ' ')
      .split('.')[0];

    return await this.boardRepository
      .createQueryBuilder('board')
      .where('board.userId = :userId', { userId })
      .orderBy('board.timestamp', 'DESC')
      .andWhere(
        'board.timestamp >= :startDate AND board.timestamp < :endDate',
        { startDate, endDate },
      )
      .getOne();
  }

  async findOneForDate(userId: number): Promise<Board[]> {
    const latestPosts: Board[] = await this.boardRepository
      .createQueryBuilder('board')
      .select('MAX(board.id) as id')
      .addSelect('board.userId')
      .addSelect('MAX(board.contents) as contents')
      .addSelect('MAX(board.timestamp) as timestamp')
      .where('userId = :userId', { userId })
      .orderBy('MAX(board.timestamp)', 'DESC')
      .groupBy('DATE(board.timestamp)') // 날짜별로 그룹화
      .getRawMany();
    return latestPosts;
  }

  async updateBoard(userId: number, boardId: number, contents: string) {
    await this.boardRepository.update(
      { userId: userId, id: boardId },
      { contents: contents },
    );
  }

  async deleteBoard(userId: number, boardId: number) {
    await this.boardRepository.delete({ userId: userId, id: boardId });
  }
}
