import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { TagsModule } from './tags/tags.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeORMDevConfig } from './configs/typeorm.config';

@Module({
  imports: [UsersModule, TagsModule, TypeOrmModule.forRoot(typeORMDevConfig)],
  controllers: [],
  providers: [],
})
export class AppModule {}
