import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from './entities/user.entity';
// import { endOfDay, startOfDay } from 'date-fns';

@Injectable()
export class UsersRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findById(id: number): Promise<User> {
    return await this.createQueryBuilder('user')
      .where('user.id = :id', { id })
      .getOne();
  }

  // findUserInfoById(userId: number) {
  //   const today = new Date();
  //   return this.createQueryBuilder('user')
  //     .leftJoinAndSelect(
  //       'user.diaries',
  //       'diary',
  //       'diary.createdAt >= :startOfDay AND diary.createdAt <= :endOfDay',
  //       {
  //         startOfDay: startOfDay(today),
  //         endOfDay: endOfDay(today),
  //       },
  //     )
  //     .leftJoinAndSelect('user.sender', 'sender')
  //     .leftJoinAndSelect('sender.receiver', 'senderR')
  //     .leftJoinAndSelect('sender.sender', 'senderS')
  //     .leftJoinAndSelect('user.receiver', 'receiver')
  //     .leftJoinAndSelect('receiver.receiver', 'receiverR')
  //     .leftJoinAndSelect('receiver.sender', 'receiverC')
  //     .where('user.id = :userId', { userId })
  //     .orderBy('diary.createdAt', 'DESC')
  //     .getOne();
  // }
}
