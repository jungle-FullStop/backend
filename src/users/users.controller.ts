import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from './utils/user.decorator';
import { User as UserEntity } from './entity/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import {
  SearchUserResponseDto,
  UpdateUserProfileRequestDto,
} from './dto/user.dto';

@ApiTags('Users API')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}
  @Get('/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ description: '사용자 정보 조회 API' })
  @ApiOkResponse({
    description: '사용자 정보 조회 성공',
    type: UserEntity,
  })
  async getUserInfo(
    @User() user: UserEntity,
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<UserEntity> {
    return this.usersService.findUserById(userId);
  }

  @Get('/search/:name')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ description: '닉네임으로 사용자 검색 API' })
  @ApiOkResponse({
    description: '닉네임을 사용자 검색 성공',
    type: Array<SearchUserResponseDto>,
  })
  searchUsers(
    @Param('name') nickname: string,
  ): Promise<SearchUserResponseDto[]> {
    return this.usersService.searchUsers(nickname);
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ description: '사용자 정보 수정 API' })
  @ApiOkResponse({
    description: '사용자 정보 수정 성공',
    type: UpdateUserProfileRequestDto,
  })
  async updateUserInfo(
    @User() user: UserEntity,
    @Body() requestDto: UpdateUserProfileRequestDto,
  ): Promise<string> {
    const newName = requestDto.name;
    const userId = user.id;
    await this.usersService.updateUserProfile(userId, newName);

    return '사용자 정보 수정에 성공했습니다.';
  }
}
