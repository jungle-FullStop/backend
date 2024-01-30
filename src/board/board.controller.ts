import {
  Controller,
  Get,
  Post,
  Param,
  Patch,
  Delete,
  Body,
} from '@nestjs/common';
import { BoardService } from './board.service';
import { BoardDeleteDto, BoardDto, BoardUpdateDto } from './dto/board.dto';
import { UsersService } from 'src/users/users.service';

@Controller('board')
export class BoardController {
  constructor(
    private boardService: BoardService,
    private userService: UsersService,
  ) {}
  @Post('/create')
  async createBoard(@Body() boardDto: BoardDto) {
    const userId = boardDto.userId;
    const contents = boardDto.contents;
    return await this.boardService.createBoard(userId, contents);
  }

  @Get('/find')
  async findAll() {
    return await this.boardService.findAll();
  }

  @Get('/find/:userId/:date?')
  async findById(@Param('userId') userId: number, @Param('date') date?: Date) {
    if (date) {
      return await this.boardService.findByDate(userId, date);
    } else {
      const user = await this.userService.findUserById(userId);
      const profileImage = user.profileImage;
      const name = user.name;

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
