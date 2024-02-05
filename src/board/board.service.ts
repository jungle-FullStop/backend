import { BoardRepository } from './board.repository';
import { Injectable } from '@nestjs/common';
import { Board } from './entity/board.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TeamStatusEvent } from '../team/events/team-status.event';
import { TeamStreamDto } from '../team/dto/team.dto';
import { User as UserEntity } from '../users/entity/user.entity';
import { UsersRepository } from '../users/users.repository';

@Injectable()
export class BoardService {
  constructor(
    private boardRepository: BoardRepository,
    private usersRepository: UsersRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createBoard(userId: number, contents: string, user: UserEntity) {
    const today = new Date();
    await this.boardRepository.save({
      userId: userId,
      contents: contents,
      timestamp: today,
    });

    const score = (await this.findByMonth(userId, today)).length;
    await this.usersRepository.updateTilScore(userId, score);

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
    return await this.boardRepository
      .createQueryBuilder('board')
      .where('userId = :userId', { userId })
      .groupBy('DATE(board.timestamp)') // 날짜별로 그룹화
      .select('MAX(board.id) as id')
      .addSelect('board.userId')
      .addSelect('MAX(board.contents) as contents')
      .addSelect('MAX(board.timestamp) as timestamp')
      .getRawMany();
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
