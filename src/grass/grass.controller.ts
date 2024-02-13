import { Body, Controller, Post, Sse, UseGuards } from '@nestjs/common';
import { TeamService } from 'src/team/team.service';
import { BoardService } from 'src/board/board.service';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { User } from 'src/users/utils/user.decorator';
import { User as UserEntity } from '../users/entity/user.entity';
import { GrassDto } from './dto/grass.dto';
import { GrassStatusEvent } from './events/grass-status.event';
// import { TeamTrackingService } from '@app/teamtracking';
import { map, startWith } from 'rxjs';
import { GrassTrackingService } from 'libs/grasstracking/src';
import { TeamRepository } from 'src/team/team.repository';

@Controller('grass')
export class GrassController {
  constructor(
    private readonly teamService: TeamService,
    private readonly teamRepository: TeamRepository,
    private readonly boardService: BoardService,
    private readonly grassTrackingService: GrassTrackingService,
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
      // const writeId = boards
      // const count =
      console.log(boards);
      teamBoard.push({ user: { profileImage, name }, boards });
    }
    return teamBoard;
  }

  @UseGuards(JwtAuthGuard)
  @Sse(GrassStatusEvent.EVENT_NAME)
  async sseTeamGrassStatus(@User() user: UserEntity) {
    // const firstStatus = {
    //   grass: (
    //     await this.teamRepository.getWrittenUserIdsByTeamCode(user.teamCode)
    //   ).length,
    //   teamCode: user.teamCode,
    // };
    return this.grassTrackingService.streamTeamStatus(user.teamCode);
  }
}
