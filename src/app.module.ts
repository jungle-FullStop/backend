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

@Module({
  imports: [
    UsersModule,
    TagsModule,
    TypeOrmModule.forRoot(typeORMDevConfig),
    ChatCompletionApiModule,
    HistoryModule,
    RedisModule.forRoot({ config: redisConfig }),
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
