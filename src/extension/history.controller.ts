import { Body, Controller, Get, Post } from '@nestjs/common';
import { HistoryService } from './history.service';
import { ExtensionHistoryDto } from './model/extension-history.dto';

@Controller('extension')
export class HistoryController {
  constructor(private readonly service: HistoryService) {}

  @Post('/history')
  async postUserHistoryFromExtension(
    @Body() extensionHistoryDto: ExtensionHistoryDto,
  ) {
    this.service.handleExtensionHistory(extensionHistoryDto);
  }

  @Get('/history')
  async getUserHistory() {
    return this.service.getHistory();
  }
}
