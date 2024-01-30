import { Injectable } from '@nestjs/common';
import { Member } from './entity/member.entity';
import { DataSource, Equal, Repository } from 'typeorm';
import { User } from 'src/users/entity/user.entity';
import { MemberStatus } from './entity/memberStatus';

@Injectable()
export class MemberRepository extends Repository<Member> {
  constructor(private dataSource: DataSource) {
    super(Member, dataSource.createEntityManager());
  }

  async findMemberRequest(
    senderId: number,
    receiverId: number,
  ): Promise<Member> {
    return await this.findOne({
      where: {
        sender: Equal(senderId),
        receiver: Equal(receiverId),
      },
    });
  }

  findRelation(userId: number, memberId: number) {
    return this.createQueryBuilder('relation')
      .where('relation.status = :status', { status: MemberStatus.COMPLETE })
      .andWhere(
        '(relation.receiverId = :userId AND relation.senderId = :memberId) OR (relation.receiverId = :memberId AND relation.senderId = :userId)',
        { userId, memberId },
      )
      .getOne();
  }

  async findUserRelationsByStatus(userId: number, status: MemberStatus) {
    return this.createQueryBuilder('member')
      .select([
        `JSON_OBJECT("id", sender.id, "email", sender.email, "name", sender.name, "profileImage", sender.profileImage) AS sender`,
        `JSON_OBJECT("id", receiver.id, "email", receiver.email, "name", receiver.name, "profileImage", receiver.profileImage) AS receiver`,
      ])
      .innerJoin('member.sender', 'sender')
      .innerJoin('member.receiver', 'receiver')
      .where('member.status = :status', { status })
      .andWhere('(member.senderId = :userId OR member.receiverId = :userId)', {
        userId,
      })
      .getRawMany();
  }

  removeRelation(relation: Member): void {
    this.remove(relation);
  }

  updateStatus(relation: Member): void {
    this.update(relation.id, { status: MemberStatus.COMPLETE });
  }
}
