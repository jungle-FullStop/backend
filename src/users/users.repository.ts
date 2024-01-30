import { Injectable } from '@nestjs/common';
import { DataSource, Repository, UpdateResult } from 'typeorm';
import { User } from './entity/user.entity';
import { AuthUserDto } from 'src/auth/dto/auth.dto';
import { SocialType } from './entity/socialType';

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

  async findBySocialIdAndSocialType(
    socialId: string,
    socialType: string,
  ): Promise<User> {
    return await this.createQueryBuilder('user')
      .where('user.socialId = :socialId', { socialId })
      .andWhere('user.socialType = :socialType', { socialType })
      .getOne();
  }

  async createUser(
    authUserDto: AuthUserDto,
    socialType: SocialType,
  ): Promise<User> {
    const { id, email, name, picture } = authUserDto;

    return this.save({
      socialId: id,
      email,
      name,
      socialType,
      profileImage: picture,
      teamCode: 'ABC',
    });
  }

  async updateTeamCode(
    userId: string,
    teamCode: string,
  ): Promise<UpdateResult> {
    return await this.createQueryBuilder('user')
      .update(User)
      .set({ teamCode })
      .where('user.email = :email', { email: userId })
      .execute();
  }

  async findByNickname(name: string): Promise<User[]> {
    return await this.createQueryBuilder('user')
      .where('user.name LIKE :name', { name: `%${name}%` })
      .getMany();
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
