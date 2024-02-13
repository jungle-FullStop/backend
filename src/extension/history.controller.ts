import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { HistoryService } from './history.service';
import { ExtensionHistoryDto } from './model/extension-history.dto';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { User } from '../users/utils/user.decorator';
import { User as UserEntity } from '../users/entity/user.entity';
import { SearchHistroyResponseDto } from './dto/history.dto';

@Controller('extension')
export class HistoryController {
  constructor(private readonly service: HistoryService) {}

  @Post('/history')
  @UseGuards(JwtAuthGuard)
  async postUserHistoryFromExtension(
    @Body() extensionHistoryDto: ExtensionHistoryDto,
    @User() user: UserEntity,
  ) {
    // console.log('USER : ', user);
    // console.log('EXTENSION HISTORY : ', extensionHistoryDto);
    extensionHistoryDto.userId = user.id.toString();
    return await this.service.handleExtensionHistory(extensionHistoryDto);
  }

  @Get('/history')
  async getUserHistory() {
    return this.service.getHistory();
  }

  @Get('/search/:keyword')
  @UseGuards(JwtAuthGuard)
  searchUsers(
    @User() user: UserEntity,
    @Param('keyword') keyword: string,
  ): Promise<SearchHistroyResponseDto[]> {
    return this.service.searchHistory(user.id, keyword);
  }
}
