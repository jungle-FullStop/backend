import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from './entity/team.entity';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';
import { TeamRepository } from './team.repository';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Team]), UsersModule],
  controllers: [TeamController],
  providers: [TeamService, TeamRepository],
  exports: [TeamService],
})
export class TeamModule {}
