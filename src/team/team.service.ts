import { Injectable } from '@nestjs/common';
import { TeamRepository } from './team.repository';
import { UsersRepository } from '../users/users.repository';

@Injectable()
export class TeamService {
  constructor(
    private teamRepository: TeamRepository,
    private usersRepository: UsersRepository,
  ) {}

  async createTeam(userId: string, teamName: string, teamCode: string) {
    await this.teamRepository.save({
      name: teamName,
      code: teamCode,
      timestamp: new Date(),
    });
    return await this.usersRepository.updateTeamCode(userId, teamCode);
  }

  async joinTeam(userId: string, teamCode: string) {
    return await this.usersRepository.updateTeamCode(userId, teamCode);
  }

  async findTeam(teamCode: string) {
    return await this.teamRepository.findOne({
      where: { code: teamCode },
    });
  }

  async deleteTeam(teamCode: string) {
    return await this.teamRepository.delete({ code: teamCode });
  }
}
