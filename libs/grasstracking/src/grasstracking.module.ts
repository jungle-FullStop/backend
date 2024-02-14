import { Global, Module } from '@nestjs/common';
// import { TeamTrackingService } from '@app/teamtracking/teamtracking.service';
import { GrassTrackingService } from './grasstracking.service';

@Global()
@Module({
  providers: [GrassTrackingService],
  exports: [GrassTrackingService],
})
export class GrasstrackingModule {}
