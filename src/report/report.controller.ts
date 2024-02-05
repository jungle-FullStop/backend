import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import { User } from 'src/users/utils/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { User as UserEntity } from '../users/entity/user.entity';
import { UpdateReportDto } from './dto/update-report.dto';

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

  @Post('/custom')
  async userPromptReport(@Body() updateReportDto: UpdateReportDto) {
    return await this.reportService.userPromptReport(updateReportDto);
  }
}
