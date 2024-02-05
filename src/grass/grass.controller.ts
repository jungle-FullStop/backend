import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { TeamService } from 'src/team/team.service';
import { BoardService } from 'src/board/board.service';

@Controller('grass')
export class GrassController {
  constructor(
    private readonly userService: UsersService,
    private readonly teamService: TeamService,
    private readonly boardService: BoardService,
  ) {}

  @Get('/:userId/:date') // 개인 해당월 잔디용
  async findById(@Param('userId') userId: number, @Param('date') date: Date) {
    const user = await this.userService.findUserById(userId);
    const profileImage = user.profileImage;
    const name = user.name;
    const boards = await this.boardService.findByMonth(userId, date);
    return { user: { profileImage, name }, boards };
  }

  @Get('/team/:userId/:date') // 팀 해당월 잔디용
  async findTeamById(
    @Param('userId') userId: number,
    @Param('date') date: Date,
  ) {
    const user = await this.userService.findUserById(userId);
    const teamuser = await this.teamService.findMemberList(user.teamCode);
    const teamBoard = [];
    for (const user of teamuser) {
      const userId = user.id;
      const profileImage = user.profileImage;
      const name = user.name;

      const boards = await this.boardService.findByMonth(userId, date);
      teamBoard.push({ user: { profileImage, name }, boards });
    }
    return teamBoard;
  }
}
