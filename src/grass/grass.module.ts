import { Module } from '@nestjs/common';
import { GrassService } from './grass.service';
import { GrassController } from './grass.controller';
import { UsersModule } from 'src/users/users.module';
import { BoardModule } from 'src/board/board.module';
import { TeamModule } from 'src/team/team.module';
import { GrassStatusListener } from './listeners/grass-status.listener';

@Module({
  imports: [UsersModule, BoardModule, TeamModule],
  controllers: [GrassController],
  providers: [GrassService, GrassStatusListener],
})
export class GrassModule {}
