import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { TeamService } from 'src/team/team.service';
import { BoardService } from 'src/board/board.service';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { User } from 'src/users/utils/user.decorator';
import { User as UserEntity } from '../users/entity/user.entity';
import { GrassDto } from './dto/grass.dto';

@Controller('grass')
export class GrassController {
  constructor(
    private readonly userService: UsersService,
    private readonly teamService: TeamService,
    private readonly boardService: BoardService,
  ) {}

  @Post('/users') // 개인 해당월 잔디용
  @UseGuards(JwtAuthGuard)
  async findUserGrass(@Body() grassDto: GrassDto, @User() user: UserEntity) {
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
}
