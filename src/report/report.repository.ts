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

  async findById(userId: number): Promise<Report> {
    const latestReport = await this.findOne({
      where: { userId },
      order: { timestamp: 'DESC' }, // timestamp를 기준으로 내림차순 정렬
      select: { report: true },
    });

    return latestReport;
  }

  async saveReport(report: string, fromDate: Date): Promise<string> {
    const reportRecord = this.create({
      userId: 1,
      report: report,
      timestamp: fromDate,
    });
    this.save(reportRecord);
    return report;
  }
}
