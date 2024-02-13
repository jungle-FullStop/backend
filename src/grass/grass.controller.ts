import { Body, Controller, Post, Sse, UseGuards } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { TeamService } from 'src/team/team.service';
import { BoardService } from 'src/board/board.service';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { User } from 'src/users/utils/user.decorator';
import { User as UserEntity } from '../users/entity/user.entity';
import { GrassDto } from './dto/grass.dto';
import { GrassStatusEvent } from './events/grass-status.event';
import { TeamTrackingService } from '@app/teamtracking';
import { map, startWith } from 'rxjs';

@Controller('grass')
export class GrassController {
  constructor(
    private readonly userService: UsersService,
    private readonly teamService: TeamService,
    private readonly boardService: BoardService,
    private readonly teamTrackingService: TeamTrackingService,
  ) {}

  @Post('/users') // 개인 해당월 잔디용
  @UseGuards(JwtAuthGuard)
  async findUserGrass(@Body() grassDto: GrassDto, @User() user: UserEntity) {
    // const user = await this.userService.findUserById(userId);
    const profileImage = user.profileImage;
    const name = user.name;
    const boards = await this.boardService.findByMonth(
      user.id,
      new Date(grassDto.date),
    );
    return { user: { profileImage, name }, boards };
  }

  @Post('/team') // 팀 해당월 잔디용
  @UseGuards(JwtAuthGuard)
  async findTeamGrass(@Body() grassDto: GrassDto, @User() user: UserEntity) {
    // const user = await this.userService.findUserById(userId);
    const teamMember = await this.teamService.findMemberList(user.teamCode);
    const teamBoard = [];
    for (const user of teamMember) {
      const userId = user.id;
      const profileImage = user.profileImage;
      const name = user.name;
      const boards = await this.boardService.findByMonth(
        userId,
        new Date(grassDto.date),
      );
      teamBoard.push({ user: { profileImage, name }, boards });
    }
    return teamBoard;
  }

  @UseGuards(JwtAuthGuard)
  @Sse(GrassStatusEvent.EVENT_NAME)
  async sseTeamGrassStatus(@User() user: UserEntity) {
    // 1. 팀의 현재 상태를 가져오는 로직
    // const currentStatus = await this.teamService.getCurrentTeamStatus(
    //   user.teamCode,
    // );

    // 2. 현재 상태를 포함한 SSE 스트림 반환
    return this.teamTrackingService.streamTeamStatus(user.teamCode).pipe(
      startWith({ data: '' }), // 현재 상태를 스트림의 첫 이벤트로 설정
      map((grass) => ({ data: grass })), // 이후 업데이트를 스트림으로 전송
    );
  }
}
