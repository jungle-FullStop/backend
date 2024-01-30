import { BadRequestException, Injectable } from '@nestjs/common';
import { MemberRepository } from './member.repository';
import { UsersRepository } from 'src/users/users.repository';
import { MemberRelationDto, StrangerResponseDto } from './dto/member.dto';
import { Member } from './entity/member.entity';
import { SearchUserResponseDto } from 'src/users/dto/user.dto';
import { MemberStatus } from './entity/memberStatus';
import { SortedUsersType } from './utils/memberType';

@Injectable()
export class MemberService {
  constructor(
    private readonly memberRepository: MemberRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async requestMember(memberRelationDto: MemberRelationDto): Promise<void> {
    const { senderId, receiverId } = memberRelationDto;

    // 예외처리
    if (senderId === receiverId) {
      throw new BadRequestException('나에게 팀원신청 보낼 수 없습니다.');
    }

    const relation = await this.memberRepository.findMemberRequest(
      senderId,
      receiverId,
    );
    if (relation) {
      throw new BadRequestException('이미 팀원신청을 하셨습니다.');
    }

    const reverseRelation = await this.memberRepository.findMemberRequest(
      receiverId,
      senderId,
    );
    if (reverseRelation) {
      throw new BadRequestException('상대의 팀원신청을 확인해주세요.');
    }

    const sender = await this.usersRepository.findById(senderId);
    const receiver = await this.usersRepository.findById(receiverId);
    this.memberRepository.save({ sender, receiver });
  }

  async cancelMemberRequest(
    memberRelationDto: MemberRelationDto,
  ): Promise<void> {
    const memberRequest = await this.checkMemberData(
      memberRelationDto.senderId,
      memberRelationDto.receiverId,
    );
    this.memberRepository.removeRelation(memberRequest);
  }

  async deleteMemberRelation(userId: number, memberId: number) {
    if (userId === memberId) {
      throw new BadRequestException('나와는 팀원신청 관리를 할 수 없습니다.');
    }

    const memberRelation = await this.memberRepository.findRelation(
      userId,
      memberId,
    );
    if (!memberRelation) {
      throw new BadRequestException('존재하지 않는 관계입니다.');
    }
    await this.memberRepository.delete(memberRelation.id);
  }

  async allowMemberRequest(
    memberRelationDto: MemberRelationDto,
  ): Promise<void> {
    const memberRequest = await this.checkMemberData(
      memberRelationDto.senderId,
      memberRelationDto.receiverId,
    );
    this.memberRepository.updateStatus(memberRequest);
  }

  async getMemberList(userId: number): Promise<SearchUserResponseDto[]> {
    const memberRelations =
      await this.memberRepository.findUserRelationsByStatus(
        userId,
        MemberStatus.COMPLETE,
      );

    const member: SearchUserResponseDto[] = memberRelations.map((relation) => {
      const member =
        relation.sender.id === userId ? relation.receiver : relation.sender;

      return {
        id: member.id,
        email: member.email,
        name: member.name,
        profileImage: member.profileImage,
        tilScore: member.tilScore,
      };
    });

    return this.sortByName(member);
  }

  async getStrangerList(userId: number): Promise<StrangerResponseDto[]> {
    const strangerRelations =
      await this.memberRepository.findUserRelationsByStatus(
        userId,
        MemberStatus.WAITING,
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

    return this.sortByName(strangers);
  }

  async searchMember(
    userId: number,
    name: string,
  ): Promise<SearchUserResponseDto[]> {
    const member = await this.getMemberList(userId);
    return member.filter((member) => member.name.includes(name));
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

  // 예외처리(팀원 신청 제외한 로직 : 신청 취소, 신청 수락, 신청 거절)
  private async checkMemberData(
    senderId: number,
    receiverId: number,
  ): Promise<Member> {
    if (senderId === receiverId) {
      throw new BadRequestException('나와는 팀원신청 관리를 할 수 없습니다.');
    }

    const relation = await this.memberRepository.findMemberRequest(
      senderId,
      receiverId,
    );
    if (!relation) {
      const reverseRelation = await this.memberRepository.findMemberRequest(
        receiverId,
        senderId,
      );

      if (reverseRelation) {
        this.checkAlreadyMember(reverseRelation);

        throw new BadRequestException('상대의 팀원신청을 확인하세요.');
      } else {
        throw new BadRequestException(
          '해당 사용자 사이의 팀원신청 기록이 없습니다.',
        );
      }
    }

    this.checkAlreadyMember(relation);

    return relation;
  }

  private checkAlreadyMember(relation: Member) {
    if (relation.status === MemberStatus.COMPLETE) {
      throw new BadRequestException('이미 팀원입니다.');
    }
  }
}
