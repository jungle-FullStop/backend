// import { Team } from '../entities/team.entity';

import { Team } from 'src/team/entities/team.entity';

export class GrassStatusEvent {
  static readonly EVENT_NAME = 'grass.status';

  readonly team: Team;

  constructor(team: Team) {
    this.team = team;
  }
}
