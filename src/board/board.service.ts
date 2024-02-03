import { BoardRepository } from './board.repository';
import { Injectable } from '@nestjs/common';
import { Board } from './entity/board.entity';
import { addDays, endOfMonth, getMonth, getYear, startOfMonth } from 'date-fns';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TeamStatusEvent } from '../team/events/team-status.event';
import { TeamStreamDto } from '../team/dto/team.dto';
import { User as UserEntity } from '../users/entity/user.entity';

@Injectable()
export class BoardService {
  constructor(
    private boardRepository: BoardRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createBoard(userId: number, contents: string, user: UserEntity) {
    await this.boardRepository.save({
      userId: userId,
      contents: contents,
      timestamp: new Date(),
    });

    const streamDTO: TeamStreamDto = {
      userId,
      status: 'written', // 또는 상태를 업데이트합니다.
      teamCode: user.teamCode,
    };

    this.eventEmitter.emit(TeamStatusEvent.EVENT_NAME, streamDTO);
  }

  async findAll(): Promise<Board[]> {
    return await this.boardRepository.find();
  }

  async findById(userId: number): Promise<Board[]> {
    return await this.boardRepository.find({
      where: { userId: userId },
    });
  }

  async findByMonth(userId: number, date: Date): Promise<Board[]> {
    // 1. 주어진 날짜의 년도와 월의 시작과 끝을 계산합니다.
    const year = getYear(date);
    const month = getMonth(date) + 1; // getMonth()는 0부터 시작하므로 +1을 해줍니다.
    const startDate = new Date(year, month - 1, 1); // 월은 0부터 시작하므로 -1을 해줍니다.
    const endDate = new Date(year, month, 0); // 해당 월의 마지막 날을 가져옵니다.

    // 2. 해당 월의 시작일부터 끝일까지를 기간으로 설정하여 게시글을 가져옵니다.
    const boards = await this.boardRepository
      .createQueryBuilder('board')
      .where('board.userId = :userId', { userId })
      .andWhere('board.timestamp BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .orderBy('board.timestamp', 'DESC')
      .getMany();

    // 3. 각 날짜별로 최신 글 하나씩 가져오기 위해 각 날짜별로 가장 최신의 글만 선택합니다.
    const uniqueBoards = [];
    const seenDates = new Set();
    for (const board of boards) {
      const boardDate = new Date(board.timestamp).toISOString().split('T')[0];
      if (!seenDates.has(boardDate)) {
        seenDates.add(boardDate);
        uniqueBoards.push(board);
      }
    }

    return uniqueBoards;
  }

  // async findByDate(userId: number, date: Date): Promise<Board> {
  //   const startDate = new Date(date)
  //     .toISOString()
  //     .replace('T', ' ')
  //     .split('.')[0];
  //   const endDate = addDays(new Date(date), 1)
  //     .toISOString()
  //     .replace('T', ' ')
  //     .split('.')[0];

  //   return await this.boardRepository
  //     .createQueryBuilder('board')
  //     .where('board.userId = :userId', { userId })
  //     .orderBy('board.timestamp', 'DESC')
  //     .andWhere(
  //       'board.timestamp >= :startDate AND board.timestamp < :endDate',
  //       { startDate, endDate },
  //     )
  //     .getOne();
  // }

  async findOneForDate(userId: number): Promise<Board[]> {
    const latestPosts: Board[] = await this.boardRepository
      .createQueryBuilder('board')
      .where('userId = :userId', { userId })
      .groupBy('DATE(board.timestamp)') // 날짜별로 그룹화
      .select('MAX(board.id) as id')
      .addSelect('board.userId')
      .addSelect('MAX(board.contents) as contents')
      .addSelect('MAX(board.timestamp) as timestamp')
      // .orderBy('MAX(board.timestamp)', 'DESC')
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
