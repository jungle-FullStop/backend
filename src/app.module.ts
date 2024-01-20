import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { TagsModule } from './tags/tags.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeORMDevConfig } from './configs/typeorm.config';
import { ChatCompletionApiModule } from './chat-completion-api/chat-completion-api.module';

@Module({
  imports: [
    UsersModule,
    TagsModule, 
    TypeOrmModule.forRoot(typeORMDevConfig),
    ChatCompletionApiModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
