import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MemberStatus } from './MemberStatus';
import { User } from 'src/users/entity/user.entity';

@Entity()
export class Member extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: MemberStatus.WAITING })
  status?: MemberStatus;

  @ManyToOne(() => User, (user) => user.sender, {
    nullable: false,
  })
  sender: User;

  @ManyToOne(() => User, (user) => user.receiver, {
    nullable: false,
  })
  receiver: User;
}
