import { BoardRepository } from './board.repository';
import { Injectable } from '@nestjs/common';
import { Board } from './entity/board.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TeamStatusEvent } from '../team/events/team-status.event';
import { TeamStreamDto } from '../team/dto/team.dto';
import { UsersRepository } from '../users/users.repository';
import { GrassStreamDto } from 'src/grass/dto/grass.dto';
import { GrassStatusEvent } from 'src/grass/events/grass-status.event';
import { TeamRepository } from 'src/team/team.repository';

@Injectable()
export class BoardService {
  constructor(
    private boardRepository: BoardRepository,
    private usersRepository: UsersRepository,
    private teamRepository: TeamRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createBoard(
    userId: number,
    teamCode: string,
    title: string,
    contents: string,
  ) {
    const today = new Date();
    await this.boardRepository.save({
      userId: userId,
      title: title,
      contents: contents,
      timestamp: today,
    });

    const score = (await this.findByMonth(userId, today)).length;
    await this.usersRepository.updateTilScore(userId, score);

    const teamStreamDTO: TeamStreamDto = {
      userId,
      status: 'written', // 또는 상태를 업데이트합니다.
      teamCode: teamCode,
    };

    this.eventEmitter.emit(TeamStatusEvent.EVENT_NAME, teamStreamDTO);

    const grassStreamDTO: GrassStreamDto = {
      // userId,
      grass: (await this.teamRepository.getWrittenUserIdsByTeamCode(teamCode))
        .length,
      teamCode: teamCode,
    };
    this.eventEmitter.emit(GrassStatusEvent.EVENT_NAME, grassStreamDTO);
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
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return await this.boardRepository
      .createQueryBuilder('board')
      .where('userId = :userId', { userId })
      .andWhere(
        'board.timestamp >= :startOfMonth AND board.timestamp <= :endOfMonth',
        {
          startOfMonth,
          endOfMonth,
        },
      )
      .groupBy('DATE(board.timestamp)') // 날짜별로 그룹화
      .select('MAX(board.id) as id')
      .addSelect('board.userId')
      .addSelect('MAX(board.contents) as contents')
      .addSelect('MAX(board.timestamp) as timestamp')
      .getRawMany();
  }

  async findOneForDate(userId: number): Promise<Board[]> {
    const subQuery = this.boardRepository
      .createQueryBuilder('board')
      .select('MAX(board.id) as id')
      .groupBy('DATE(board.timestamp)'); // 날짜별로 그룹화

    return await this.boardRepository
      .createQueryBuilder('board')
      .where('userId = :userId', { userId })
      .innerJoin(`(${subQuery.getQuery()})`, 'sub', 'board.id = sub.id')
      .select('board.id as id')
      .addSelect('board.userId')
      .addSelect('board.title as title')
      .addSelect('board.contents as contents')
      .addSelect('board.timestamp as timestamp')
      .getRawMany();
  }

  async findOneForDateByBoardID(boardId: number): Promise<Board> {
    return await this.boardRepository
      .createQueryBuilder('board')
      .andWhere('id = :boardId', { boardId })
      .select('board.id as id')
      .addSelect('board.userId as userId')
      .addSelect('board.title as title')
      .addSelect('board.contents as contents')
      .addSelect('board.timestamp as timestamp')
      .getRawOne();
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
