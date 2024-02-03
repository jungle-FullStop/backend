import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from './entity/board.entity';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import { BoardRepository } from './board.repository';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Board]), UsersModule],
  controllers: [BoardController],
  providers: [BoardService, BoardRepository],
})
export class BoardModule {}
