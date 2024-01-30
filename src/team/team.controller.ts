import { TeamService } from './team.service';
import { Body, Controller, Delete, Post } from '@nestjs/common';
import { TeamDeleteDto, TeamDto, TeamFindDto } from './dto/team.dto';
@Controller('team')
export class TeamController {
  constructor(private teamService: TeamService) {}
  @Post('/create')
  async createTeam(@Body() teamDto: TeamDto) {
    const userId = teamDto.userId;
    const teamName = teamDto.name;
    const teamCode = teamDto.code;
    return await this.teamService.createTeam(userId, teamName, teamCode);
  }

  @Post('/join')
  async joinTeam(@Body() teamDto: TeamDto) {
    const userId = teamDto.userId;
    const teamCode = teamDto.code;
    return await this.teamService.joinTeam(userId, teamCode);
  }

  @Post('/find')
  async findTeam(@Body() teamFindDto: TeamFindDto) {
    const teamCode = teamFindDto.code;
    return await this.teamService.findTeam(teamCode);
  }
  @Delete('/delete')
  async deleteTeam(@Body() teamDeleteDto: TeamDeleteDto) {
    // const userId = teamDeleteDto.userId;
    const teamCode = teamDeleteDto.code;
    return await this.teamService.deleteTeam(teamCode);
  }
}
