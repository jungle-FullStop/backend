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
    return await this.boardService.createBoard(
      user.id,
      user.teamCode,
      boardDto.title,
      boardDto.contents,
    );
  }

  @Get('/find') // 전체 Til
  async findAll() {
    return await this.boardService.findAll();
  }

  @Get('/find/:userId') // 해당 userId 전체 Til
  async findById(@Param('userId') userId: number) {
    const user = await this.userService.findUserById(userId);
    const profileImage = user.profileImage;
    const name = user.name;
    const boards = await this.boardService.findOneForDate(userId);
    return { user: { profileImage, name }, boards };
  }

  @Get('/find/detail/:boardId') // 해당 userId 전체 Til
  async findByBoardId(@Param('boardId') boardId: number) {
    const board = await this.boardService.findOneForDateByBoardID(boardId);
    const user = await this.userService.findUserById(board.userId);
    const profileImage = user.profileImage;
    const name = user.name;
    return { user: { profileImage, name }, board };
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
