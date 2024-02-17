import { Injectable } from '@nestjs/common';
import { TeamStatusEvent } from '../events/team-status.event';
import { OnEvent } from '@nestjs/event-emitter';
import { TeamRepository } from '../team.repository';
import { TeamTrackingService } from '@app/teamtracking';
import { TeamStreamDto } from '../dto/team.dto';

@Injectable()
export class TeamStatusListener {
  constructor(
    private readonly teamRepository: TeamRepository,
    private readonly teamTrackingService: TeamTrackingService,
  ) {}
  private STATUS_WRITING = 'writing';
  private STATUS_WRITTEN = 'written';
  private STATUS_NOT_WRITTEN = 'not_written';

  @OnEvent(TeamStatusEvent.EVENT_NAME, { async: true })
  async handleTeamStatusUpdate(streamDTO: TeamStreamDto) {
    const teamCode = streamDTO.teamCode.toString();
    await this.updateUserStatusBasedOnEvent(teamCode, streamDTO);

    const teamStatusList = await this.compileTeamStatusList(teamCode);

    this.teamTrackingService.pushTeamStatusUpdate(
      teamCode,
      JSON.stringify({ data: teamStatusList }),
    );
  }

  async updateUserStatusBasedOnEvent(
    teamCode: string,
    streamDTO: TeamStreamDto,
  ): Promise<void> {
    if (streamDTO.status === this.STATUS_WRITING) {
      await this.teamRepository.saveTeamStatusListInRedis(
        teamCode,
        streamDTO.userId,
      );
    } else if (
      streamDTO.status === this.STATUS_WRITTEN ||
      streamDTO.status === this.STATUS_NOT_WRITTEN
    ) {
      await this.teamRepository.deleteTeamUserStatus(
        teamCode,
        streamDTO.userId,
      );
    }
  }

  async compileTeamStatusList(
    teamCode: string,
  ): Promise<Record<string, string>> {
    const userList = await this.teamRepository.getTeamUserList(teamCode);
    const teamStatusList = await this.teamRepository.getTeamStatusListFromRedis(
      teamCode,
      userList,
    );

    const writtenUserIds =
      await this.teamRepository.getWrittenUserIdsByTeamCode(teamCode);
    writtenUserIds.forEach((userId) => {
      teamStatusList[userId] = this.STATUS_WRITTEN;
    });

    return teamStatusList;
  }
}
