import { Controller, Get, Param } from '@nestjs/common';
import { MindmapService } from './mindmap.service';

@Controller('mindmap')
export class MindmapController {
  constructor(private readonly mindmapservice: MindmapService) {}

  @Get('/find/:userId')
  async findById(@Param('userId') userId: number) {
    return await this.mindmapservice.findMindmap(userId);
  }

  @Get('/create/:userId')
  async createMindmap(@Param('userId') userId: number) {
    const fromDate = new Date();
    return await this.mindmapservice.createMindmap(userId, fromDate);
  }
}
