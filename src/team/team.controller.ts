import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TeamService } from './team.service';
import { User } from 'src/users/utils/user.decorator';
import { User as UserEntity } from 'src/users/entity/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { SearchUserResponseDto } from 'src/users/dto/user.dto';
import { StrangerResponseDto } from './dto/team.dto';

@ApiTags('team API')
@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get('/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ description: '특정 사용자의 팀 목록 조회' })
  @ApiOkResponse({ description: '팀 목록 조회 성공' })
  async getTeamList(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<Record<string, SearchUserResponseDto[]>> {
    const team = await this.teamService.getTeamList(userId);

    return { team };
  }

  @Delete('/:teamId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ description: '팀 삭제 API' })
  @ApiOkResponse({ description: '팀 삭제 성공' })
  async deleteTeamRelation(
    @User() user: UserEntity,
    @Param('teamId', ParseIntPipe) teamId: number,
  ) {
    await this.teamService.deleteTeamRelation(user.id, teamId);

    return '팀가 삭제되었습니다.';
  }

  @Get('request/:userId')
  @ApiOperation({ description: '특정 사용자의 진행 중인 팀신청 목록 조회' })
  @ApiOkResponse({ description: '진행 중인 팀 신청 조회 성공' })
  async getTeamRequestList(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<Record<string, StrangerResponseDto[]>> {
    const strangers = await this.teamService.getStrangerList(userId);

    return { strangers };
  }

  @Post('request/:receiverId')
  @ApiOperation({ description: '팀 신청 API' })
  @ApiCreatedResponse({ description: '팀 신청 성공' })
  async requestTeam(
    @User() user: UserEntity,
    @Param('receiverId', ParseIntPipe) receiverId: number,
  ): Promise<string> {
    await this.teamService.requestTeam({ senderId: user.id, receiverId });

    return '팀 신청이 완료되었습니다.';
  }

  @Delete('request/:receiverId')
  @ApiOperation({ description: '내가 보낸 팀 신청 취소 API' })
  @ApiOkResponse({ description: '팀 신청 취소 성공' })
  async cancelTeamRequest(
    @User() user: UserEntity,
    @Param('receiverId', ParseIntPipe) receiverId: number,
  ): Promise<string> {
    await this.teamService.cancelTeamRequest({ senderId: user.id, receiverId });

    return '팀 신청이 취소되었습니다.';
  }

  @Post('allow/:senderId')
  @ApiOperation({ description: '팀 신청 수락 API' })
  @ApiOkResponse({ description: '팀 신청 수락 성공' })
  async allowTeamRequest(
    @User() user: UserEntity,
    @Param('senderId', ParseIntPipe) senderId: number,
  ): Promise<string> {
    await this.teamService.allowTeamRequest({ senderId, receiverId: user.id });
    return '팀 신청을 수락했습니다.';
  }

  @Delete('allow/:senderId')
  @ApiOperation({ description: '내가 받은 팀 신청 거절 API' })
  @ApiOkResponse({ description: '팀 신청 거절 성공' })
  async rejectTeamRequest(
    @User() user: UserEntity,
    @Param('senderId', ParseIntPipe) senderId: number,
  ): Promise<string> {
    await this.teamService.cancelTeamRequest({ senderId, receiverId: user.id });
    return '팀 신청을 거절했습니다.';
  }

  @Get('search/:name')
  @ApiOperation({ description: '나의 팀 목록에서 팀 검색' })
  @ApiOkResponse({ description: '팀 검색 성공' })
  async searchTeam(
    @User() user: UserEntity,
    @Param('name') name: string,
  ): Promise<SearchUserResponseDto[]> {
    return this.teamService.searchTeam(user.id, name);
  }
}
