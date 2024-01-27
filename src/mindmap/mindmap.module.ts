import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mindmap } from './entity/mindmap.entity';
import { MindmapController } from './mindmap.controller';
import { MindmapRepository } from './mindmap.repository';
import { MindmapService } from './mindmap.service';
import { HistoryModule } from 'src/extension/history.module';

@Module({
  imports: [TypeOrmModule.forFeature([Mindmap]), HistoryModule],
  controllers: [MindmapController],
  providers: [MindmapService, MindmapRepository],
})
export class MindmapModule {}
