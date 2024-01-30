import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { MemberService } from './member.service';
import { User } from 'src/users/utils/user.decorator';
import { User as UserEntity } from 'src/users/entity/user.entity';
import { SearchUserResponseDto } from 'src/users/dto/user.dto';
import { StrangerResponseDto } from './dto/member.dto';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';

@Controller('member')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Get('/:userId')
  @UseGuards(JwtAuthGuard)
  async getMemberList(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<Record<string, SearchUserResponseDto[]>> {
    const member = await this.memberService.getMemberList(userId);

    return { member };
  }

  @Delete('/:memberId')
  @UseGuards(JwtAuthGuard)
  async deleteMemberRelation(
    @User() user: UserEntity,
    @Param('memberId', ParseIntPipe) memberId: number,
  ) {
    await this.memberService.deleteMemberRelation(user.id, memberId);

    return '팀이 삭제되었습니다.';
  }

  @Get('request/:userId')
  @UseGuards(JwtAuthGuard)
  async getMemberRequestList(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<Record<string, StrangerResponseDto[]>> {
    const strangers = await this.memberService.getStrangerList(userId);

    return { strangers };
  }

  @Post('request/:receiverId')
  @UseGuards(JwtAuthGuard)
  async requestMember(
    @User() user: UserEntity,
    @Param('receiverId', ParseIntPipe) receiverId: number,
  ): Promise<string> {
    await this.memberService.requestMember({ senderId: user.id, receiverId });

    return '팀 신청이 완료되었습니다.';
  }

  @Delete('request/:receiverId')
  @UseGuards(JwtAuthGuard)
  async cancelMemberRequest(
    @User() user: UserEntity,
    @Param('receiverId', ParseIntPipe) receiverId: number,
  ): Promise<string> {
    await this.memberService.cancelMemberRequest({
      senderId: user.id,
      receiverId,
    });

    return '팀 신청이 취소되었습니다.';
  }

  @Post('allow/:senderId')
  @UseGuards(JwtAuthGuard)
  async allowMemberRequest(
    @User() user: UserEntity,
    @Param('senderId', ParseIntPipe) senderId: number,
  ): Promise<string> {
    await this.memberService.allowMemberRequest({
      senderId,
      receiverId: user.id,
    });
    return '팀 신청을 수락했습니다.';
  }

  @Delete('allow/:senderId')
  @UseGuards(JwtAuthGuard)
  async rejectMemberRequest(
    @User() user: UserEntity,
    @Param('senderId', ParseIntPipe) senderId: number,
  ): Promise<string> {
    await this.memberService.cancelMemberRequest({
      senderId,
      receiverId: user.id,
    });
    return '팀 신청을 거절했습니다.';
  }

  @Get('search/:name')
  @UseGuards(JwtAuthGuard)
  async searchMember(
    @User() user: UserEntity,
    @Param('name') name: string,
  ): Promise<SearchUserResponseDto[]> {
    return this.memberService.searchMember(user.id, name);
  }
}