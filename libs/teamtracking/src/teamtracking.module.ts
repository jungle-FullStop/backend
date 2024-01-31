import { Global, Module } from '@nestjs/common';
import { TeamTrackingService } from '@app/teamtracking/teamtracking.service';

@Global()
@Module({
  providers: [TeamTrackingService],
  exports: [TeamTrackingService],
})
export class TeamtrackingModule {}
