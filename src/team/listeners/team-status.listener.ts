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

  @OnEvent(TeamStatusEvent.EVENT_NAME, { async: true })
  async handleTeamStatusUpdate(streamDTO: TeamStreamDto) {
    const teamCode = streamDTO.teamCode.toString();

    // console.log(teamCode);
    // 레디스에서 해당 팀의 상태 리스트를 조회합니다.
    const teamStatusList =
      await this.teamRepository.getTeamStatusListFromRedis(teamCode);
    console.log('teamStatusList');

    const writtenUserIds =
      await this.teamRepository.getWrittenUserIdsByTeamCode(teamCode);

    console.log('writtenUserIds');

    writtenUserIds.forEach((userId) => {
      teamStatusList[userId] = 'written';
    });
    // 특정 사용자의 상태를 업데이트합니다.
    teamStatusList[streamDTO.userId] = streamDTO.status;

    // 업데이트된 상태 리스트를 레디스에 저장합니다.
    await this.teamRepository.saveTeamStatusListInRedis(
      teamCode,
      teamStatusList,
    );

    this.teamTrackingService.pushTeamStatusUpdate(
      teamCode,
      JSON.stringify({ data: teamStatusList }),
    );
  }
}
