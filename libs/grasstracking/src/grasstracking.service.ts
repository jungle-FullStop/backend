import { Injectable } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';

@Injectable()
export class GrassTrackingService {
  private teamStatusUpdates: Record<string, Subject<string>> = {};

  getTeamStatusUpdateObservable(teamId: string): Observable<string> {
    const statusKey = `team_${teamId}_status`;
    if (!this.teamStatusUpdates[statusKey]) {
      this.teamStatusUpdates[statusKey] = new Subject<string>();
    }
    console.log(Object.keys(this.teamStatusUpdates));
    return this.teamStatusUpdates[statusKey].asObservable();
  }

  pushTeamStatusUpdate(teamId: string, status: string): void {
    const statusKey = `team_${teamId}_status`;
    if (!this.teamStatusUpdates[statusKey]) {
      this.teamStatusUpdates[statusKey] = new Subject<string>();
    }
    // console.log(statusKey);
    this.teamStatusUpdates[statusKey].next(status);
  }

  streamTeamStatus(teamId: string): Observable<string> {
    return this.getTeamStatusUpdateObservable(`${teamId}`);
  }
}
