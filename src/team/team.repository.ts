import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Team } from './entities/team.entity';
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
    userList: number[], // Assuming user IDs are numeric
  ): Promise<Record<number, string>> {
    const teamStatusList: Record<number, string> = {};

    for (const userId of userList) {
      const key = `team_${teamId}_${userId}`;
      const status = await this.redisService.get(key);
      if (status) {
        teamStatusList[userId] = 'writing';
      }
    }

    return teamStatusList;
  }

  // 레디스에 업데이트된 팀 상태 리스트를 저장하는 메서드
  async saveTeamStatusListInRedis(
    teamId: number | string,
    userCode: number,
  ): Promise<void> {
    const ttl = 180;

    await this.redisService.set(
      `team_${teamId}_${userCode}`,
      'writing',
      'EX', // EX 옵션은 TTL을 초 단위로 설정합니다.
      ttl,
    );
  }

  async deleteTeamUserStatus(
    teamId: number | string,
    userCode: number,
  ): Promise<void> {
    await this.redisService.del(`team_${teamId}_${userCode}`);
  }

  async getTeamUserList(teamCode: string) {
    const userList = await this.dataSource
      .getRepository(User)
      .createQueryBuilder('user')
      .where('teamCode = :teamCode', { teamCode })
      .select('user.id')
      .getMany();

    return Array.from(new Set(userList.map((user) => user.id)));
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

    return Array.from(new Set(writtenUsers.map((user) => user.userId)));
  }

  async getWrittenUserIdsPercentageByTeamCode(
    teamCode: string,
  ): Promise<number> {
    const today = new Date();
    const todayStart = new Date(today.setHours(0, 0, 0, 0));
    const todayEnd = new Date(today.setHours(23, 59, 59, 999));

    const totalUsersCount = await this.dataSource
      .getRepository(User)
      .createQueryBuilder('user')
      .where('user.teamCode = :teamCode', { teamCode })
      .getCount();

    // const writtenUsersCount = await this.dataSource
    //   .getRepository(Board)
    //   .createQueryBuilder('board')
    //   .leftJoin('board.user', 'user')
    //   .where('user.teamCode = :teamCode', { teamCode })
    //   .andWhere('board.timestamp BETWEEN :start AND :end', {
    //     start: todayStart,
    //     end: todayEnd,
    //   })
    //   .select('DISTINCT board.userId')
    //   .getCount();
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

    const writtenUsersCount = Array.from(
      new Set(writtenUsers.map((user) => user.userId)),
    ).length;

    const writtenUserPercentage = (writtenUsersCount / totalUsersCount) * 100;
    return writtenUserPercentage;
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
      .addSelect('user.email', 'email')
      .addSelect('user.profileImage', 'profileImage')
      .addSelect('user.tilScore', 'tilScore')
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

    // console.log(userlist);
    // 결과 포맷을 정리하여 반환
    return userlist.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.userStatus,
      profileImage: user.profileImage,
      tilScore: user.tilScore,
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
  async findTeam(teamCode: string) {
    return await this.findOne({
      where: { code: teamCode },
    });
  }
}
