import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { TagsModule } from './tags/tags.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeORMDevConfig } from './configs/typeorm.config';
import { ChatCompletionApiModule } from './chat-completion-api/chat-completion-api.module';
import { HistoryModule } from './extension/history.module';
import { AuthModule } from './auth/auth.module';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { redisConfig } from './configs/redis.config';
import { ReportModule } from './report/report.module';
import { MindmapModule } from './mindmap/mindmap.module';
import { BoardModule } from './board/board.module';
import { TeamModule } from './team/team.module';
import { FriendsModule } from './friends/friends.module';
import { FirebaseModule } from './firebase/firebase.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { eventEmitterConfig } from '../configs/event-emitter.config';
import { TeamtrackingModule } from '@app/teamtracking';
import { GrassModule } from './grass/grass.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(eventEmitterConfig),
    UsersModule,
    TagsModule,
    TypeOrmModule.forRoot(typeORMDevConfig),
    ChatCompletionApiModule,
    HistoryModule,
    RedisModule.forRoot({ config: redisConfig }),
    AuthModule,
    ReportModule,
    MindmapModule,
    BoardModule,
    TeamModule,
    FriendsModule,
    FirebaseModule,
    TeamtrackingModule,
    GrassModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
