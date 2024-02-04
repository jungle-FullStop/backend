// import { EventEmitter2 } from 'eventemitter2';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TeamStatusEvent } from './events/team-status.event';
import { TeamStreamDto } from './dto/team.dto';
import { TeamRepository } from './team.repository';
import { UsersRepository } from '../users/users.repository';
import { User as UserEntity } from '../users/entity/user.entity';
import { Team } from './entities/team.entity';
import { SearchUserResponseDto } from '../users/dto/user.dto';
import { StrangerResponseDto } from '../friends/dto/friend.dto';
import { SortedUsersType } from '../friends/utils/friendsType';

@Injectable()
export class TeamService {
  private readonly emitter: EventEmitter2;
  private readonly onlineUserSet: Set<string>;

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private teamRepository: TeamRepository,
    private usersRepository: UsersRepository,
  ) {
    // Inject some Service here and everything about SSE will stop to work.
    // this.emitter = new EventEmitter2({
    //   wildcard: true,
    //   delimiter: '.',
    // });
    // this.onlineUserSet = new Set<string>();
  }

  // 팀상태를 업데이트 치는 구간이라고 볼 수 있을 것 같다
  // 애를 호출하는 시점이, 글 수정하기 버튼 클릭했을 떄?

  async startWriting(teamId: number, userId: number) {
    // 팀원들의 userId 리스트를 DB에서 가져옵니다.

    // 갱신된 정보를 이벤트와 함께 전송합니다.
    const streamDTO: TeamStreamDto = {
      userId,
      status: 'writing', // 또는 상태를 업데이트합니다.
      teamCode: teamId.toString(),
    };
    this.eventEmitter.emit(TeamStatusEvent.EVENT_NAME, streamDTO);
  }

  async updateTeamMemberStatus(user_entity: UserEntity, status: string) {
    // 팀원들의 userId 리스트를 DB에서 가져옵니다.

    // 갱신된 정보를 이벤트와 함께 전송합니다.
    const streamDTO: TeamStreamDto = {
      userId: user_entity.id,
      status: status, // 또는 상태를 업데이트합니다.
      teamCode: user_entity.teamCode,
    };
    this.eventEmitter.emit(TeamStatusEvent.EVENT_NAME, streamDTO);
  }

  async getCurrentTeamStatus(teamCode: string): Promise<any> {
    // 팀 상태를 레디스에서 조회하는 로직
    return await this.teamRepository.getTeamStatusListFromRedis(teamCode);
  }

  async createTeam(
    userId: number,
    teamName: string,
    teamDescription: string,
  ): Promise<Team> {
    const teamCode = Math.random().toString(36).substr(2, 8).toUpperCase();
    const team = await this.teamRepository.save({
      name: teamName,
      code: teamCode,
      description: teamDescription,
    });
    if (team) {
      await this.usersRepository.updateTeamCode(userId, teamCode);
    }
    return await this.teamRepository.findOne({
      where: { code: teamCode },
    });
  }

  async joinTeam(userId: number, teamCode: string): Promise<Team> {
    const team = await this.teamRepository.findOne({
      where: { code: teamCode },
    });
    if (team) {
      await this.usersRepository.updateTeamCode(userId, teamCode);
    }
    return team;
  }

  async findTeam(teamCode: string) {
    return await this.teamRepository.findOne({
      where: { code: teamCode },
    });
  }

  async findMemberList(teamCode: string) {
    const members = await this.teamRepository.getMyTeamUsers(teamCode);
    return this.sortByName(members);
  }

  async findMemberRankList(teamCode: string) {
    const members = await this.teamRepository.getMyTeamUsers(teamCode);
    return this.sortByRank(members);
  }

  async deleteMember(teamCode: string) {}

  async deleteTeam(teamCode: string) {
    return await this.teamRepository.delete({ code: teamCode });
  }

  async searchMember(
    teamCode: string,
    name: string,
  ): Promise<SearchUserResponseDto[]> {
    const members = await this.findMemberList(teamCode);
    return members.filter((friend) => friend.name.includes(name));
  }

  private sortByName<T extends SearchUserResponseDto[] | StrangerResponseDto[]>(
    users: T,
  ): SortedUsersType<T> {
    return users.sort((a, b) => {
      const nameA = a.name.toUpperCase();
      const nameB = b.name.toUpperCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    }) as SortedUsersType<T>;
  }

  private sortByRank<T extends SearchUserResponseDto[] | StrangerResponseDto[]>(
    users: T,
  ): SortedUsersType<T> {
    return users.sort((a, b) => {
      return b.tilScore - a.tilScore;
    }) as SortedUsersType<T>;
  }

  // subscribe(userId: string): Observable<MessageEvent> {
  //   console.log(`subscribe: ${userId}`);
  //   this.onlineUserSet.add(userId);
  //   return fromEvent(this.emitter, `${userId}.**`).pipe(
  //     map((data) => {
  //       const eventName = (this.emitter as any).event as string;
  //       return {
  //         type: eventName,
  //         retry: 1000,
  //         data,
  //       } as MessageEvent;
  //     }),
  //   );
  // }

  // userID -> TeamId 가 되어야 하고, TeamID로 찔렀을 때, 모든 팀원들이 받아야 하지?
  // 그렇다면 해당 TeamID를 받았다라는 건은 어쨰든 이사람이 우리 사이트에 접속되어있다라는 뜻이고
  // 팀이 없을 때에는 팀을 만드는 로직, 팀이 있다면 거기에 나를 추가해줘야 함
  // emit에 userID를 찔러넣으면,

  // 사용자가 에디터를 들어갔을 때 -> active 로 설정되어야 하고
  // 사용자가 에디터를 등록하였을 때  -> complete 로 설정되어야 함
  // 위에 들어갔을 때, 등록하였을 때, 등록하다 도중에 나갔을 때 에 대한 상태값들이 변경되면 어떤 부분을 호출하여 상태값 업데이트
  // 업데이트 되면서 emit 되어서 관련된 팀페이지 SSE에 전송하여, 실시간으로 해당 팀페이지를 확인할 수 있게 만든다

  // emit(userId: string, eventName: string, data: any) {
  //   // Emit 를 보내는 건 엔드포인트로 울리는 부분은 아닐 것 같고
  //   console.log(`emit: ${userId}.${eventName}: ${data}`);
  //   this.emitter.emit(`${userId}.${eventName}`, data);
  // }
}

// edit에 들어갔어 -> 그러면 emit으로 자신의 속한 팀에 유저들의 이벤트를 전부 재실행해준다
// 이러한 부분을 넣을려면 Edit에서 상태를 변경하게 하는 곳에서 이러한 team.service 내부적으로 특정 함수를 실행시키는 수밖에 없겠음
// Emit에는 팀의 pk 값을 key값으로 만들고 사용자 엔티티를 푸쉬해서 관리하는 방법
// 이벤트를 등록했을 때
