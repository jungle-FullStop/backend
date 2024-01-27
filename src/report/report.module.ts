import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistoryModule } from 'src/extension/history.module';
import { ReportRepository } from './report.repository';
import { Report } from './entities/report.entity';
import { ChatCompletionApiModule } from 'src/chat-completion-api/chat-completion-api.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Report]),
    HistoryModule,
    ChatCompletionApiModule,
  ],
  controllers: [ReportController],
  providers: [ReportService, ReportRepository],
})
export class ReportModule {}
