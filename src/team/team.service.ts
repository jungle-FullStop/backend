import { BadRequestException, Injectable } from '@nestjs/common';
import { TeamRepository } from './team.repository';
import { UsersRepository } from 'src/users/users.repository';
import { TeamRelationDto, StrangerResponseDto } from './dto/team.dto';
import { Team } from './entity/team.entity';
import { SearchUserResponseDto } from 'src/users/dto/user.dto';
import { TeamStatus } from './entity/teamStatus';
import { SortedUsersType } from './utils/teamType';

@Injectable()
export class TeamService {
  constructor(
    private readonly teamRepository: TeamRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async requestTeam(teamRelationDto: TeamRelationDto): Promise<void> {
    const { senderId, receiverId } = teamRelationDto;

    // 예외처리
    if (senderId === receiverId) {
      throw new BadRequestException('나에게 친구신청 보낼 수 없습니다.');
    }

    const relation = await this.teamRepository.findTeamRequest(
      senderId,
      receiverId,
    );
    if (relation) {
      throw new BadRequestException('이미 친구신청을 하셨습니다.');
    }

    const reverseRelation = await this.teamRepository.findTeamRequest(
      receiverId,
      senderId,
    );
    if (reverseRelation) {
      throw new BadRequestException('상대의 친구신청을 확인해주세요.');
    }

    const sender = await this.usersRepository.findById(senderId);
    const receiver = await this.usersRepository.findById(receiverId);
    this.teamRepository.createTeam(sender, receiver);
  }

  async cancelTeamRequest(teamRelationDto: TeamRelationDto): Promise<void> {
    const teamRequest = await this.checkTeamData(
      teamRelationDto.senderId,
      teamRelationDto.receiverId,
    );
    this.teamRepository.removeRelation(teamRequest);
  }

  async deleteTeamRelation(userId: number, teamId: number) {
    if (userId === teamId) {
      throw new BadRequestException('나와는 친구신청 관리를 할 수 없습니다.');
    }

    const teamRelation = await this.teamRepository.findRelation(userId, teamId);
    if (!teamRelation) {
      throw new BadRequestException('존재하지 않는 관계입니다.');
    }
    await this.teamRepository.delete(teamRelation.id);
  }

  async allowTeamRequest(teamRelationDto: TeamRelationDto): Promise<void> {
    const teamRequest = await this.checkTeamData(
      teamRelationDto.senderId,
      teamRelationDto.receiverId,
    );
    this.teamRepository.updateStatus(teamRequest);
  }

  async getTeamList(userId: number): Promise<SearchUserResponseDto[]> {
    const teamRelations = await this.teamRepository.findUserRelationsByStatus(
      userId,
      TeamStatus.COMPLETE,
    );

    const team: SearchUserResponseDto[] = teamRelations.map((relation) => {
      const team =
        relation.sender.id === userId ? relation.receiver : relation.sender;

      return {
        id: team.id,
        email: team.email,
        name: team.name,
        profileImage: team.profileImage,
      };
    });

    return this.sortByNickname(team);
  }

  async getStrangerList(userId: number): Promise<StrangerResponseDto[]> {
    const strangerRelations =
      await this.teamRepository.findUserRelationsByStatus(
        userId,
        TeamStatus.WAITING,
      );

    const strangers: StrangerResponseDto[] = strangerRelations.map(
      (relation) => {
        const stranger =
          relation.sender.id === userId ? relation.receiver : relation.sender;

        return {
          senderId: relation.sender.id,
          receiverId: relation.receiver.id,
          email: stranger.email,
          name: stranger.name,
          profileImage: stranger.profileImage,
        };
      },
    );

    return this.sortByNickname(strangers);
  }

  async searchTeam(
    userId: number,
    name: string,
  ): Promise<SearchUserResponseDto[]> {
    const team = await this.getTeamList(userId);
    return team.filter((team) => team.name.includes(name));
  }

  private sortByNickname<
    T extends SearchUserResponseDto[] | StrangerResponseDto[],
  >(users: T): SortedUsersType<T> {
    return users.sort((a, b) => {
      const nameA = a.name.toUpperCase();
      const nameB = b.name.toUpperCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    }) as SortedUsersType<T>;
  }

  // 예외처리(친구 신청 제외한 로직 : 신청 취소, 신청 수락, 신청 거절)
  private async checkTeamData(
    senderId: number,
    receiverId: number,
  ): Promise<Team> {
    if (senderId === receiverId) {
      throw new BadRequestException('나와는 친구신청 관리를 할 수 없습니다.');
    }

    const relation = await this.teamRepository.findTeamRequest(
      senderId,
      receiverId,
    );
    if (!relation) {
      const reverseRelation = await this.teamRepository.findTeamRequest(
        receiverId,
        senderId,
      );

      if (reverseRelation) {
        this.checkAlreadyTeam(reverseRelation);

        throw new BadRequestException('상대의 친구신청을 확인하세요.');
      } else {
        throw new BadRequestException(
          '해당 사용자 사이의 친구신청 기록이 없습니다.',
        );
      }
    }

    this.checkAlreadyTeam(relation);

    return relation;
  }

  private checkAlreadyTeam(relation: Team) {
    if (relation.status === TeamStatus.COMPLETE) {
      throw new BadRequestException('이미 친구입니다.');
    }
  }
}
