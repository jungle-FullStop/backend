import { Injectable } from '@nestjs/common';
import { DataSource, Repository, UpdateResult } from 'typeorm';
import { User } from './entity/user.entity';
import { AuthUserDto } from 'src/auth/dto/auth.dto';
import { SocialType } from './entity/socialType';
import { SaveTokenDto } from 'src/firebase/firebase.dto';

// import { endOfDay, startOfDay } from 'date-fns';

@Injectable()
export class UsersRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async saveToken(tokenDto: SaveTokenDto): Promise<string> {
    const { id, token } = tokenDto;
    const user = await this.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    user.firebaseToken = token;
    await this.save(user);
    return token;
  }

  async findTargetToken(userId: number): Promise<User> {
    return await this.createQueryBuilder('target')
      .where('target.id = :id', { id: userId })
      .select('target.firebaseToken')
      .getOne();
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
      tilScore: 0,
    });
  }

  async updateTeamCode(
    userId: number,
    teamCode: string,
  ): Promise<UpdateResult> {
    return await this.createQueryBuilder('user')
      .update(User)
      .set({ teamCode })
      .where('user.id = :id', { id: userId })
      .execute();
  }

  async updateName(userId: number, name: string): Promise<UpdateResult> {
    return await this.createQueryBuilder('user')
      .update(User)
      .set({ name })
      .where('user.id = :id', { id: userId })
      .execute();
  }

  async findByName(name: string): Promise<User[]> {
    return await this.createQueryBuilder('user')
      .where('user.name LIKE :name', { name: `%${name}%` })
      .getMany();
  }

  async updateTilScore(userId: number, score: number): Promise<void> {
    await this.createQueryBuilder('user')
      .update(User)
      .set({ tilScore: score })
      .where('user.id = :id', { id: userId })
      .execute();
  }
}
