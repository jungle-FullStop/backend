import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { FriendsService } from './friends.service';
import { User } from 'src/users/utils/user.decorator';
import { User as UserEntity } from 'src/users/entity/user.entity';
import { SearchUserResponseDto } from 'src/users/dto/user.dto';
import { StrangerResponseDto } from './dto/friend.dto';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';

@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Get('/:userId')
  @UseGuards(JwtAuthGuard)
  async getFriendsList(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<Record<string, SearchUserResponseDto[]>> {
    const friends = await this.friendsService.getFriendsList(userId);

    return { friends };
  }

  @Get('/rank/:userId')
  @UseGuards(JwtAuthGuard)
  async getFriendsRankList(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<Record<string, SearchUserResponseDto[]>> {
    const friends = await this.friendsService.getFriendsRankList(userId);

    return { friends };
  }

  @Delete('/:friendId')
  @UseGuards(JwtAuthGuard)
  async deleteFriendRelation(
    @User() user: UserEntity,
    @Param('friendId', ParseIntPipe) friendId: number,
  ) {
    await this.friendsService.deleteFriendRelation(user.id, friendId);

    return '친구가 삭제되었습니다.';
  }

  @Get('/request/:userId')
  @UseGuards(JwtAuthGuard)
  async getFriendRequestList(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<Record<string, StrangerResponseDto[]>> {
    const strangers = await this.friendsService.getStrangerList(userId);

    return { strangers };
  }

  @Post('/request/:receiverId')
  @UseGuards(JwtAuthGuard)
  async requestFriend(
    @User() user: UserEntity,
    @Param('receiverId', ParseIntPipe) receiverId: number,
  ): Promise<string> {
    await this.friendsService.requestFriend({ senderId: user.id, receiverId });

    return '친구 신청이 완료되었습니다.';
  }

  @Delete('/request/:receiverId')
  @UseGuards(JwtAuthGuard)
  async cancelFriendRequest(
    @User() user: UserEntity,
    @Param('receiverId', ParseIntPipe) receiverId: number,
  ): Promise<string> {
    await this.friendsService.cancelFriendRequest({
      senderId: user.id,
      receiverId,
    });

    return '친구 신청이 취소되었습니다.';
  }

  @Post('/allow/:senderId')
  @UseGuards(JwtAuthGuard)
  async allowFriendRequest(
    @User() user: UserEntity,
    @Param('senderId', ParseIntPipe) senderId: number,
  ): Promise<string> {
    await this.friendsService.allowFriendRequest({
      senderId,
      receiverId: user.id,
    });
    return '친구 신청을 수락했습니다.';
  }

  @Delete('/allow/:senderId')
  @UseGuards(JwtAuthGuard)
  async rejectFriendRequest(
    @User() user: UserEntity,
    @Param('senderId', ParseIntPipe) senderId: number,
  ): Promise<string> {
    await this.friendsService.cancelFriendRequest({
      senderId,
      receiverId: user.id,
    });
    return '친구 신청을 거절했습니다.';
  }

  @Get('/search/:name')
  @UseGuards(JwtAuthGuard)
  async searchFriend(
    @User() user: UserEntity,
    @Param('name') name: string,
  ): Promise<SearchUserResponseDto[]> {
    return this.friendsService.searchFriend(user.id, name);
  }
}
