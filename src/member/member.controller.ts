import {
  Body,
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
import { BoardDto } from '../board/dto/board.dto';

@Controller('team')
export class MemberController {
  constructor(private readonly teamService: MemberService) {}
  @Post('/create')
  async createTeam(@Body() userId: number) {
    const fromDate = new Date();
    const team = await this.teamService.createTeam(userId, fromDate);
  }

  @Get('/:userId')
  async getTeamList(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<Record<string, SearchUserResponseDto[]>> {
    const team = await this.teamService.getTeamList(userId);

    return { team };
  }

  @Delete('/:teamId')
  async deleteTeamRelation(
    @User() user: UserEntity,
    @Param('teamId', ParseIntPipe) teamId: number,
  ) {
    await this.teamService.deleteTeamRelation(user.id, teamId);

    return '팀이 삭제되었습니다.';
  }

  @Get('request/:userId')
  async getTeamRequestList(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<Record<string, StrangerResponseDto[]>> {
    const strangers = await this.teamService.getStrangerList(userId);

    return { strangers };
  }

  @Post('request/:receiverId')
  async requestTeam(
    @User() user: UserEntity,
    @Param('receiverId', ParseIntPipe) receiverId: number,
  ): Promise<string> {
    await this.teamService.requestTeam({ senderId: user.id, receiverId });

    return '팀 신청이 완료되었습니다.';
  }

  @Delete('request/:receiverId')
  async cancelTeamRequest(
    @User() user: UserEntity,
    @Param('receiverId', ParseIntPipe) receiverId: number,
  ): Promise<string> {
    await this.teamService.cancelTeamRequest({ senderId: user.id, receiverId });

    return '팀 신청이 취소되었습니다.';
  }

  @Post('allow/:senderId')
  async allowTeamRequest(
    @User() user: UserEntity,
    @Param('senderId', ParseIntPipe) senderId: number,
  ): Promise<string> {
    await this.teamService.allowTeamRequest({ senderId, receiverId: user.id });
    return '팀 신청을 수락했습니다.';
  }

  @Delete('allow/:senderId')
  async rejectTeamRequest(
    @User() user: UserEntity,
    @Param('senderId', ParseIntPipe) senderId: number,
  ): Promise<string> {
    await this.teamService.cancelTeamRequest({ senderId, receiverId: user.id });
    return '팀 신청을 거절했습니다.';
  }

  @Get('search/:name')
  async searchTeam(
    @User() user: UserEntity,
    @Param('name') name: string,
  ): Promise<SearchUserResponseDto[]> {
    return this.teamService.searchTeam(user.id, name);
  }
}
