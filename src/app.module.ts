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
import { MemberModule } from './member/member.module';
import { FirebaseModule } from './firebase/firebase.module';

@Module({
  imports: [
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
    MemberModule,
    FirebaseModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
