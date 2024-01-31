import { TeamService } from './team.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Sse,
  UseGuards,
} from '@nestjs/common';
import { TeamDeleteDto, TeamDto, TeamFindDto } from './dto/team.dto';
import { interval, map, Observable, startWith } from 'rxjs';
import { TeamTrackingService } from '@app/teamtracking';
import { TeamStatusEvent } from './events/team-status.event';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { User } from '../users/utils/user.decorator';
import { User as UserEntity } from '../users/entity/user.entity';

@Controller('team')
export class TeamController {
  constructor(
    private teamService: TeamService,
    private readonly teamtrackingService: TeamTrackingService,
  ) {}

  @Post('/create')
  async createTeam(@Body() teamDto: TeamDto) {
    const userId = teamDto.userId;
    const teamName = teamDto.name;
    const teamCode = teamDto.code;
    return await this.teamService.createTeam(userId, teamName, teamCode);
  }

  @Post('/join')
  async joinTeam(@Body() teamDto: TeamDto) {
    const userId = teamDto.userId;
    const teamCode = teamDto.code;
    return await this.teamService.joinTeam(userId, teamCode);
  }

  @Post('/find')
  async findTeam(@Body() teamFindDto: TeamFindDto) {
    const teamCode = teamFindDto.code;
    return await this.teamService.findTeam(teamCode);
  }

  @Post('/my')
  @UseGuards(JwtAuthGuard)
  async findMyTeamUsers(@User() user: UserEntity) {
    return await this.teamService.findMyTeamUsers(user.teamCode);
  }

  @Delete('/delete')
  async deleteTeam(@Body() teamDeleteDto: TeamDeleteDto) {
    // const userId = teamDeleteDto.userId;
    const teamCode = teamDeleteDto.code;
    return await this.teamService.deleteTeam(teamCode);
  }

  @UseGuards(JwtAuthGuard)
  @Sse(TeamStatusEvent.EVENT_NAME)
  async sseTeamStatus(@User() user: UserEntity) {
    // 1. 팀의 현재 상태를 가져오는 로직
    const currentStatus = await this.teamService.getCurrentTeamStatus(
      user.teamCode,
    );

    // 2. 현재 상태를 포함한 SSE 스트림 반환
    return this.teamtrackingService.streamTeamStatus(user.teamCode).pipe(
      startWith({ data: currentStatus }), // 현재 상태를 스트림의 첫 이벤트로 설정
      map((status) => ({ data: status })), // 이후 업데이트를 스트림으로 전송
    );
  }

  // 글을 수정하는 버튼을 눌렀을 떄에 발생하는 코드로
  @Get('start-writing')
  startWriting(
    @Query('teamId') teamId: number,
    @Query('userId') userId: number,
  ) {
    this.teamService.startWriting(teamId, userId);
    return { message: 'Writing started.' };
  }
}

// @Controller('team')
// export class TeamController {
//   constructor(
//     private readonly teamService: TeamService,
//     private readonly teamtrackingService: TeamTrackingService,
//   ) {}
//
//   // @Sse('status')
//   // sse(
//   //   @Req() request: Request,
//   //   @Query('userId') userId: string,
//   // ): Observable<MessageEvent> {
//   //   return this.teamService.subscribe(userId);
//   // }
//
//   @Sse(TeamStatusEvent.EVENT_NAME)
//   sseTeamStatus() {
//     return this.teamtrackingService.streamTeamStatus(
//       TeamStatusEvent.EVENT_NAME,
//       1,
//     );
//   }
//
//   // 글을 수정하는 버튼을 눌렀을 떄에 발생하는 코드로?
//   @Get('start-writing')
//   startWriting(
//     @Query('teamId') teamId: number,
//     @Query('userId') userId: number,
//   ) {
//     this.teamService.startWriting(teamId, userId);
//     return { message: 'Writing started.' };
//   }
//
//   // @Get('emit')
//   // emit(
//   //   @Query('userId') userId: string,
//   //   @Query('eventName') eventName: string,
//   //   @Query('eventData') eventData: string,
//   // ) {
//   //   this.teamService.emit(userId, eventName, eventData);
//   // }
// }
