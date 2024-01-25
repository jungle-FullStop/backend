import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { HistoryService } from './history.service';
import { ExtensionHistoryDto } from './model/extension-history.dto';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { User } from '../users/utils/user.decorator';
import { User as UserEntity } from '../users/entity/user.entity';

@Controller('extension')
export class HistoryController {
  constructor(private readonly service: HistoryService) {}

  @Post('/history')
  @UseGuards(JwtAuthGuard)
  async postUserHistoryFromExtension(
    @Body() extensionHistoryDto: ExtensionHistoryDto,
    @User() user: UserEntity,
  ) {
    console.log('USER : ', user);
    extensionHistoryDto.userId = user.id.toString();
    this.service.handleExtensionHistory(extensionHistoryDto);
  }

  @Get('/history')
  async getUserHistory() {
    return this.service.getHistory();
  }
}
