import { Injectable } from '@nestjs/common';
import { Team } from './entity/team.entity';
import { DataSource, Equal, Repository } from 'typeorm';
import { User } from 'src/users/entity/user.entity';
import { TeamStatus } from './entity/teamStatus';

@Injectable()
export class TeamRepository extends Repository<Team> {
  constructor(private dataSource: DataSource) {
    super(Team, dataSource.createEntityManager());
  }

  createTeam(sender: User, receiver: User): void {
    this.save({ sender, receiver });
  }

  async findTeamRequest(senderId: number, receiverId: number): Promise<Team> {
    return await this.findOne({
      where: {
        sender: Equal(senderId),
        receiver: Equal(receiverId),
      },
    });
  }

  findRelation(userId: number, teamId: number) {
    return this.createQueryBuilder('relation')
      .where('relation.status = :status', { status: TeamStatus.COMPLETE })
      .andWhere(
        '(relation.receiverId = :userId AND relation.senderId = :teamId) OR (relation.receiverId = :teamId AND relation.senderId = :userId)',
        { userId, teamId },
      )
      .getOne();
  }

  async findUserRelationsByStatus(userId: number, status: TeamStatus) {
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

  removeRelation(relation: Team): void {
    this.remove(relation);
  }

  updateStatus(relation: Team): void {
    this.update(relation.id, { status: TeamStatus.COMPLETE });
  }
}
