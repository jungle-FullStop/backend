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
import { Board } from '../../board/entity/board.entity';
import { Friend } from '../../friends/entity/friend.entity';

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

  @Column()
  teamCode: string;

  @Column()
  tilScore: number;

  @OneToMany(() => Board, (board) => board.user)
  boards: Board[];

  @OneToMany(() => Friend, (user) => user.sender, { cascade: true })
  sender: Friend[];

  @OneToMany(() => Friend, (user) => user.receiver, { cascade: true })
  receiver: Friend[];

  @Column()
  firebaseToken: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
