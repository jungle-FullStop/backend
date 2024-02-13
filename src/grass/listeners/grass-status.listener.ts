import { Injectable } from '@nestjs/common';
import { GrassStatusEvent } from '../events/grass-status.event';
import { OnEvent } from '@nestjs/event-emitter';
// import { TeamRepository } from '../team.repository';
import { TeamTrackingService } from '@app/teamtracking';
// import { TeamStreamDto } from '../dto/team.dto';
import { GrassStreamDto } from '../dto/grass.dto';
import { TeamRepository } from 'src/team/team.repository';

@Injectable()
export class TeamStatusListener {
  constructor(
    private readonly teamRepository: TeamRepository,
    private readonly teamTrackingService: TeamTrackingService,
  ) {}

  @OnEvent(GrassStatusEvent.EVENT_NAME, { async: true })
  async handleTeamStatusUpdate(grassStreamDTO: GrassStreamDto) {
    const teamCode = grassStreamDTO.teamCode.toString();

    this.teamTrackingService.pushTeamStatusUpdate(
      teamCode,
      JSON.stringify({ data: grassStreamDTO }),
    );
  }
}
