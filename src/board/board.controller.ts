import {
  Controller,
  Get,
  Post,
  Param,
  Patch,
  Delete,
  Body,
  UseGuards,
} from '@nestjs/common';
import { BoardService } from './board.service';
import { BoardDeleteDto, BoardDto, BoardUpdateDto } from './dto/board.dto';
import { UsersService } from 'src/users/users.service';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { User } from '../users/utils/user.decorator';
import { User as UserEntity } from '../users/entity/user.entity';

@Controller('board')
export class BoardController {
  constructor(
    private boardService: BoardService,
    private userService: UsersService,
  ) {}

  @Post('/create')
  @UseGuards(JwtAuthGuard)
  async createBoard(@Body() boardDto: BoardDto, @User() user: UserEntity) {
    const userId = boardDto.userId;
    const contents = boardDto.contents;
    return await this.boardService.createBoard(userId, contents, user);
  }

  @Get('/find')
  async findAll() {
    return await this.boardService.findAll();
  }

  @Get('/find/:userId/:date?') // 전체 Til 가져오기, 개인 해당월 잔디용
  async findById(@Param('userId') userId: number, @Param('date') date?: Date) {
    const user = await this.userService.findUserById(userId);
    const profileImage = user.profileImage;
    const name = user.name;
    if (date) {
      const boards = await this.boardService.findByMonth(userId, date);
      return { user: { profileImage, name }, boards };
    } else {
      const boards = await this.boardService.findOneForDate(userId);
      return { user: { profileImage, name }, boards };
    }
  }

  @Patch('/update')
  async updateBoard(@Body() boardUpdateDto: BoardUpdateDto) {
    const userId = boardUpdateDto.userId;
    const boardId = boardUpdateDto.boardId;
    const contents = boardUpdateDto.contents;
    return await this.boardService.updateBoard(userId, boardId, contents);
  }

  @Delete('/delete')
  async deleteBoard(@Body() boardDeleteDto: BoardDeleteDto) {
    const userId = boardDeleteDto.userId;
    const boardId = boardDeleteDto.boardId;
    return await this.boardService.deleteBoard(userId, boardId);
  }
}
