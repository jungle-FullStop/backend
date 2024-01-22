import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';
// import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
// import { GetUserResponseDto } from './dto/user.dto';
import { User } from './utils/user.decorator';
import { User as UserEntity } from './entity/user.entity';
// import { FileInterceptor } from '@nestjs/platform-express';
// import { IMAGE_TYPE_REGEX } from 'src/images/utils/images.constant';

@ApiTags('Users API')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // @Patch()
  // @UseGuards(JwtAuthGuard)
  // @UseInterceptors(FileInterceptor('profileImage'))
  // @ApiOperation({ description: '사용자 정보 수정 API' })
  // @ApiOkResponse({ description: '사용자 정보 수정 성공', type: UpdateUserProfileRequestDto })
  // async updateUserInfo(
  //   @User() user: UserEntity,
  //   @UploadedFile(
  //     new ParseFilePipe({
  //       fileIsRequired: false,
  //       validators: [new FileTypeValidator({ fileType: IMAGE_TYPE_REGEX })],
  //     }),
  //   )
  //     profileImage: Express.Multer.File,
  //   @Body() requestDto: UpdateUserProfileRequestDto,
  // ): Promise<string> {
  //   await this.usersService.updateUserProfile(user, requestDto, profileImage);
  //
  //   return '사용자 정보 수정에 성공했습니다.';
  // }

  @Get('/:userId')
  // @UseGuards(JwtAuthGuard)
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
}
