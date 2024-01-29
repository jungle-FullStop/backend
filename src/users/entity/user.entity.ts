import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SocialType } from './socialType';
import { Team } from '../../team/entity/team.entity';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  name: string;

  @Column({ unique: true })
  socialId: string;

  @Column()
  socialType: SocialType;

  @Column({ length: 2083 })
  profileImage: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => Team, (friend) => friend.sender, { cascade: true })
  sender: Team[];

  @OneToMany(() => Team, (friend) => friend.receiver, { cascade: true })
  receiver: Team[];
}
