import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Team } from './entity/team.entity';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { Board } from '../board/entity/board.entity';
import { User } from '../users/entity/user.entity';

@Injectable()
export class TeamRepository extends Repository<Team> {
  constructor(
    private dataSource: DataSource,
    @InjectRedis() private readonly redisService: Redis,
  ) {
    super(Team, dataSource.createEntityManager());
  }

  async getTeamStatusListFromRedis(
    teamId: string,
  ): Promise<Record<number, string>> {
    const statusListString = await this.redisService.get(
      `team_${teamId}_status`,
    );
    return statusListString ? JSON.parse(statusListString) : {};
  }

  // 레디스에 업데이트된 팀 상태 리스트를 저장하는 메서드
  async saveTeamStatusListInRedis(
    teamId: string,
    statusList: Record<number, string>,
  ): Promise<void> {
    const ttl = this.calculateSecondsUntilMidnight();

    await this.redisService.set(
      `team_${teamId}_status`,
      JSON.stringify(statusList),
      'EX', // EX 옵션은 TTL을 초 단위로 설정합니다.
      ttl,
    );
  }

  async getWrittenUserIdsByTeamCode(teamCode: string): Promise<number[]> {
    const today = new Date();
    const todayStart = new Date(today.setHours(0, 0, 0, 0));
    const todayEnd = new Date(today.setHours(23, 59, 59, 999));

    const writtenUsers = await this.dataSource
      .getRepository(Board)
      .createQueryBuilder('board')
      .leftJoinAndSelect('board.user', 'user')
      .where('user.teamCode = :teamCode', { teamCode })
      .andWhere('board.timestamp BETWEEN :start AND :end', {
        start: todayStart,
        end: todayEnd,
      })
      .select('board.userId')
      .distinct(true)
      .getMany();

    return writtenUsers.map((user) => user.userId);
  }

  async getMyTeamUsers(teamCode: string) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const userlist = await this.dataSource
      .getRepository(User)
      .createQueryBuilder('user')
      .leftJoin(
        'user.boards',
        'board',
        'board.timestamp BETWEEN :todayStart AND :todayEnd',
        { todayStart, todayEnd },
      )
      .select('user.id', 'id')
      .addSelect('user.name', 'name')
      .addSelect('user.profileImage', 'profileImage')
      .addSelect(
        `
      CASE 
        WHEN MAX(board.id) IS NOT NULL THEN 'written' 
        ELSE 'not_written' 
      END`,
        'userStatus',
      )
      .where('user.teamCode = :teamCode', { teamCode })
      .groupBy('user.id')
      .getRawMany();

    console.log(userlist);
    // 결과 포맷을 정리하여 반환
    return userlist.map((user) => ({
      id: user.id,
      name: user.name,
      status: user.userStatus,
      profileImage: user.profileImage,
      // 다른 필요한 필드들...
    }));
  }

  private calculateSecondsUntilMidnight(): number {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0); // 다음 날 자정으로 설정

    const secondsUntilMidnight = (midnight.getTime() - now.getTime()) / 1000;
    return Math.round(secondsUntilMidnight);
  }

  // 해당 팀코드에 해당되는 유저 전부 불러오기
}
