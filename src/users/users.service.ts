import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { SearchUserResponseDto } from './dto/user.dto';
import { UpdateResult } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findUserById(userId: number) {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new BadRequestException('존재하지 않는 사용자 정보입니다.');
    }
    return user;
  }

  async searchUsers(name: string): Promise<SearchUserResponseDto[]> {
    const users = await this.usersRepository.findByName(name);

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      profileImage: user.profileImage,
      tilScore: user.tilScore,
    }));
  }

  async updateUserProfile(
    userId: number,
    newName: string,
  ): Promise<UpdateResult> {
    return this.usersRepository.updateName(userId, newName);
  }
}
