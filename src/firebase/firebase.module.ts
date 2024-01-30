import { Module } from '@nestjs/common';
import { FirebaseController } from './firebase.controller';
import { FirebaseCloudMessageService } from './firebase.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [FirebaseController],
  providers: [FirebaseCloudMessageService],
  exports: [],
  imports: [UsersModule],
})
export class FirebaseModule {}
