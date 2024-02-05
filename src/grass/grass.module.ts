import { Module } from '@nestjs/common';
import { GrassService } from './grass.service';
import { GrassController } from './grass.controller';
import { UsersModule } from 'src/users/users.module';
import { BoardModule } from 'src/board/board.module';
import { TeamModule } from 'src/team/team.module';

@Module({
  imports: [UsersModule, BoardModule, TeamModule],
  controllers: [GrassController],
  providers: [GrassService],
})
export class GrassModule {}
