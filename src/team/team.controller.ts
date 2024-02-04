import { TeamService } from './team.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Sse,
  UseGuards,
} from '@nestjs/common';
import { TeamDto } from './dto/team.dto';
import { map, startWith } from 'rxjs';
import { TeamTrackingService } from '@app/teamtracking';
import { TeamStatusEvent } from './events/team-status.event';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { User } from '../users/utils/user.decorator';
import { User as UserEntity } from '../users/entity/user.entity';

@Controller('team')
export class TeamController {
  constructor(
    private teamService: TeamService,
    private readonly teamTrackingService: TeamTrackingService,
  ) {}

  @Post('/create')
  @UseGuards(JwtAuthGuard)
  async createTeam(@User() user: UserEntity, @Body() teamDto: TeamDto) {
    const teamName = teamDto.name;
    const teamDescription = teamDto.description;
    return await this.teamService.createTeam(
      user.id,
      teamName,
      teamDescription,
    );
  }

  @Post('/join')
  @UseGuards(JwtAuthGuard)
  async joinTeam(@User() user: UserEntity, @Body() teamDto: TeamDto) {
    const teamCode = teamDto.code;
    return await this.teamService.joinTeam(user.id, teamCode);
  }

  @Get('/:teamCode')
  @UseGuards(JwtAuthGuard)
  async findTeam(
    @User() user: UserEntity,
    @Param('teamCode') teamCode: string,
  ) {
    return await this.teamService.findTeam(teamCode);
  }

  @Post('/my')
  @UseGuards(JwtAuthGuard)
  async findMyTeamUsers(@User() user: UserEntity) {
    return await this.teamService.findMyTeamUsers(user.teamCode);
  }

  @Delete('/delete')
  @UseGuards(JwtAuthGuard)
  async deleteTeam(@User() user: UserEntity) {
    return await this.teamService.deleteTeam(user.teamCode);
  }

  @UseGuards(JwtAuthGuard)
  @Sse(TeamStatusEvent.EVENT_NAME)
  async sseTeamStatus(@User() user: UserEntity) {
    // 1. 팀의 현재 상태를 가져오는 로직
    const currentStatus = await this.teamService.getCurrentTeamStatus(
      user.teamCode,
    );

    // 2. 현재 상태를 포함한 SSE 스트림 반환
    return this.teamTrackingService.streamTeamStatus(user.teamCode).pipe(
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

  @UseGuards(JwtAuthGuard)
  @Post('change-status')
  async changeStatus(@User() user: UserEntity, @Body('status') status: string) {
    // status를 Enum 스럽게 쓰는 것이 훨씬 좋을 듯
    return await this.teamService.updateTeamMemberStatus(user, status);
  }
}

// 사용자가 글을 쓰는 페이지에 들어감, 페이지에서 저장안하고 나가는 시점을 잡는 곳

// @Controller('team')
// export class TeamController {
//   constructor(
//     private readonly teamService: TeamService,
//     private readonly teamTrackingService: TeamTrackingService,
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
//     return this.teamTrackingService.streamTeamStatus(
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
