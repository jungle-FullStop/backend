import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { TagsModule } from './tags/tags.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeORMDevConfig } from './configs/typeorm.config';
import { ChatCompletionApiModule } from './chat-completion-api/chat-completion-api.module';
import { HistoryModule } from './extension/history.module';

@Module({
  imports: [
    UsersModule,
    TagsModule,
    TypeOrmModule.forRoot(typeORMDevConfig),
    ChatCompletionApiModule,
    HistoryModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
