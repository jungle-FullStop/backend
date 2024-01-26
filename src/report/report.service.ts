import { Injectable } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportRepository } from './report.repository';
import { HistoryService } from 'src/extension/history.service';
import { ChatCompletionApiService } from 'src/chat-completion-api/chat-completion-api.service';
import { Report } from './entities/report.entity';

@Injectable()
export class ReportService {
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly historyservice: HistoryService,
    private readonly chatservice: ChatCompletionApiService,
  ) {}

  async findById(userId: number, fromDate: Date): Promise<Report> {
    return await this.reportRepository.findById(userId);
  }

  async createSaveReport(userId: number, fromDate: Date): Promise<string> {
    // 여기서 userId를 사용하여 DB에서 해당 사용자의 검색 기록을 가져온다고 가정
    const searchHistory = await this.historyservice.getSearchHistoryByUserId(
      userId,
      fromDate,
    );
    const preprocessSearchHistory: string[] = searchHistory.map(
      (history) => history.processedTitle,
    );

    // 검색 기록을 string 형태로 변환하여 GetChatCompletionAnswerInputDTO에 담기
    const data: CreateReportDto = {
      message: preprocessSearchHistory.join(' '), // 예시: 검색 기록을 공백으로 구분한 문자열로 변환
    };
    // 결과 반환
    const report = await this.chatservice.getReport(data);

    return await this.reportRepository.saveReport(report.aiMessage, fromDate);
  }
  // create(createReportDto: CreateReportDto) {
  //   return 'This action adds a new report';
  // }

  // findAll() {
  //   return `This action returns all report`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} report`;
  // }

  // update(id: number, updateReportDto: UpdateReportDto) {
  //   return `This action updates a #${id} report`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} report`;
  // }
}
