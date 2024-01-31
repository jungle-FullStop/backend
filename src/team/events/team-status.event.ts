import { Team } from '../entities/team.entity';

export class TeamStatusEvent {
  static readonly EVENT_NAME = 'team.status';

  readonly team: Team;

  constructor(team: Team) {
    this.team = team;
  }
}
