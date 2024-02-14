import { Controller, Get, UseGuards } from '@nestjs/common';
import { MindmapService } from './mindmap.service';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { User } from '../users/utils/user.decorator';
import { User as UserEntity } from '../users/entity/user.entity';

@Controller('mindmap')
export class MindmapController {
  constructor(private readonly mindmapservice: MindmapService) {}

  @Get('/find')
  @UseGuards(JwtAuthGuard)
  async findById(@User() user: UserEntity) {
    return await this.mindmapservice.findMindmap(user.id);
  }

  @Get('/create')
  @UseGuards(JwtAuthGuard)
  async createMindmap(@User() user: UserEntity) {
    const fromDate = new Date();
    return await this.mindmapservice.createMindmap(user.id, fromDate);
  }
}
