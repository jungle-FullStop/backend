import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import { User } from 'src/users/utils/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { User as UserEntity } from '../users/entity/user.entity';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('/find')
  @UseGuards(JwtAuthGuard)
  async findById(@User() user: UserEntity) {
    const fromDate = new Date();
    // console.log(fromDate);
    fromDate.setHours(0, 0, 0, 0);
    return await this.reportService.findById(user.id, fromDate);
  }

  @Get('/create')
  @UseGuards(JwtAuthGuard)
  async createSaveReport(@User() user: UserEntity) {
    const fromDate = new Date();
    // console.log(fromDate);
    return await this.reportService.createSaveReport(user.id, fromDate);
  }
}
