import { Injectable } from '@nestjs/common';
import { Friend } from './entity/friend.entity';
import { DataSource, Equal, Repository } from 'typeorm';
import { User } from 'src/users/entity/user.entity';
import { FriendStatus } from './entity/friendStatus';

@Injectable()
export class FriendsRepository extends Repository<Friend> {
  constructor(private dataSource: DataSource) {
    super(Friend, dataSource.createEntityManager());
  }

  createFriend(sender: User, receiver: User): void {
    this.save({ sender, receiver });
  }

  async findFriendRequest(
    senderId: number,
    receiverId: number,
  ): Promise<Friend> {
    return await this.findOne({
      where: {
        sender: Equal(senderId),
        receiver: Equal(receiverId),
      },
    });
  }

  findRelation(userId: number, friendId: number) {
    return this.createQueryBuilder('relation')
      .where('relation.status = :status', { status: FriendStatus.COMPLETE })
      .andWhere(
        '(relation.receiverId = :userId AND relation.senderId = :friendId) OR (relation.receiverId = :friendId AND relation.senderId = :userId)',
        { userId, friendId },
      )
      .getOne();
  }

  async findUserRelationsByStatus(userId: number, status: FriendStatus) {
    return this.createQueryBuilder('friend')
      .select([
        `JSON_OBJECT("id", sender.id, "email", sender.email, "name", sender.name, "profileImage", sender.profileImage, "tilScore", sender.tilScore) AS sender`,
        `JSON_OBJECT("id", receiver.id, "email", receiver.email, "name", receiver.name, "profileImage", receiver.profileImage, "tilScore", receiver.tilScore) AS receiver`,
      ])
      .innerJoin('friend.sender', 'sender')
      .innerJoin('friend.receiver', 'receiver')
      .where('friend.status = :status', { status })
      .andWhere('(friend.senderId = :userId OR friend.receiverId = :userId)', {
        userId,
      })
      .getRawMany();
  }

  removeRelation(relation: Friend): void {
    this.remove(relation);
  }

  updateStatus(relation: Friend): void {
    this.update(relation.id, { status: FriendStatus.COMPLETE });
  }
}
