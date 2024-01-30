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
import { Member } from '../../member/entity/member.entity';

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

  @OneToMany(() => Member, (member) => member.sender, { cascade: true })
  sender: Member[];

  @OneToMany(() => Member, (member) => member.receiver, { cascade: true })
  receiver: Member[];

  @Column()
  firebaseToken: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
