import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Report } from './entities/report.entity';

@Injectable()
export class ReportRepository extends Repository<Report> {
  constructor(private dataSource: DataSource) {
    super(Report, dataSource.createEntityManager());
  }

  // async findById(userId: number,fromDate:Date): Promise<object> {
  //     const latestreport = await this.createQueryBuilder('report')
  //       .where('report.userId = :userId', { userId })
  //       .andWhere('report.timestamp > :fromDate', { fromDate })
  //       .orderBy('report.timestamp', 'DESC') // timestamp를 기준으로 내림차순 정렬
  //       .select('report.report')
  //       .getOne();

  //     if (!latestreport)  {
  //         return null;
  //     }

  //     const parsedReport = JSON.parse(latestreport.report);
  //     return parsedReport;
  //     // return latestreport.report;
  // }

  async saveReport(
    userId: number,
    report: string,
    fromDate: Date,
  ): Promise<Report> {
    const reportRecord = this.create({
      userId: userId,
      report: report,
      timestamp: fromDate,
    });
    await this.save(reportRecord);
    return reportRecord;
  }
}
