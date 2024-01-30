import { Injectable } from '@nestjs/common';
import { Member } from './entity/member.entity';
import { DataSource, Equal, Repository } from 'typeorm';
import { User } from 'src/users/entity/user.entity';
import { MemberStatus } from './entity/MemberStatus';

@Injectable()
export class MemberRepository extends Repository<Member> {
  constructor(private dataSource: DataSource) {
    super(Member, dataSource.createEntityManager());
  }

  createTeam(userId: number, fromDate: Date): void {}

  createTeamRelation(sender: User, receiver: User): void {
    this.save({ sender, receiver });
  }

  async findTeamRequest(senderId: number, receiverId: number): Promise<Member> {
    return await this.findOne({
      where: {
        sender: Equal(senderId),
        receiver: Equal(receiverId),
      },
    });
  }

  findRelation(userId: number, teamId: number) {
    return this.createQueryBuilder('relation')
      .where('relation.status = :status', { status: MemberStatus.COMPLETE })
      .andWhere(
        '(relation.receiverId = :userId AND relation.senderId = :teamId) OR (relation.receiverId = :teamId AND relation.senderId = :userId)',
        { userId, teamId },
      )
      .getOne();
  }

  async findUserRelationsByStatus(userId: number, status: MemberStatus) {
    return this.createQueryBuilder('team')
      .select([
        `JSON_OBJECT("id", sender.id, "email", sender.email, "name", sender.name, "profileImage", sender.profileImage) AS sender`,
        `JSON_OBJECT("id", receiver.id, "email", receiver.email, "name", receiver.name, "profileImage", receiver.profileImage) AS receiver`,
      ])
      .innerJoin('team.sender', 'sender')
      .innerJoin('team.receiver', 'receiver')
      .where('team.status = :status', { status })
      .andWhere('(team.senderId = :userId OR team.receiverId = :userId)', {
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
