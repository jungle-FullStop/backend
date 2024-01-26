import { Controller, Get, Param } from '@nestjs/common';
import { ReportService } from './report.service';
import { User } from 'src/users/utils/user.decorator';

@Controller('report')
export class ReportController {
  constructor(private readonly reportservice: ReportService) {}

  @Get('/find/:userId')
  async findById(@Param('userId') userId: number) {
    const fromDate = new Date();
    // console.log(fromDate);
    fromDate.setHours(0, 0, 0, 0);
    return await this.reportservice.findById(userId, fromDate);
  }

  @Get('/create/:userId')
  async createSaveReport(@Param('userId') userId: number) {
    const fromDate = new Date(); // 나중에 파라미터로 받아야할 듯?
    // console.log(fromDate);
    return await this.reportservice.createSaveReport(userId, fromDate);
  }

  //   @Post()
  //   create(@Body() createReportDto: CreateReportDto) {
  //     return this.reportService.create(createReportDto);
  //   }

  //   @Get()
  //   findAll() {
  //     return this.reportService.findAll();
  //   }

  //   @Get(':id')
  //   findOne(@Param('id') id: string) {
  //     return this.reportService.findOne(+id);
  //   }

  //   @Patch(':id')
  //   update(@Param('id') id: string, @Body() updateReportDto: UpdateReportDto) {
  //     return this.reportService.update(+id, updateReportDto);
  //   }

  //   @Delete(':id')
  //   remove(@Param('id') id: string) {
  //     return this.reportService.remove(+id);
  //   }
}
