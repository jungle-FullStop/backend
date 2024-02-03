import { Module } from '@nestjs/common';
import { GrassService } from './grass.service';
import { GrassController } from './grass.controller';

@Module({
  controllers: [GrassController],
  providers: [GrassService],
})
export class GrassModule {}
