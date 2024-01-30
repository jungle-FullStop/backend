import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class TeamRelationDto {
  @IsNotEmpty()
  @ApiProperty({ description: '팀신청 보낸 사용자' })
  senderId: number;

  @IsNotEmpty()
  @ApiProperty({ description: '팀신청 받은 사용자' })
  receiverId: number;
}

export class StrangerResponseDto {
  @ApiProperty({ description: '팀신청 보낸 사용자' })
  senderId: number;

  @ApiProperty({ description: '팀신청 받은 사용자' })
  receiverId: number;

  @ApiProperty({ description: '사용자 이메일' })
  email: string;

  @ApiProperty({ description: '사용자 닉네임' })
  name: string;

  @ApiProperty({ description: '사용자 프로필 이미지' })
  profileImage: string;
}
