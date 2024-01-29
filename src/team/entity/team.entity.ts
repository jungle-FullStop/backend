import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TeamStatus } from './teamStatus';
import { User } from 'src/users/entity/user.entity';

@Entity()
export class Team extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: TeamStatus.WAITING })
  status?: TeamStatus;

  @ManyToOne(() => User, (user) => user.sender, {
    nullable: false,
  })
  sender: User;

  @ManyToOne(() => User, (user) => user.receiver, {
    nullable: false,
  })
  receiver: User;
}
