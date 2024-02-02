import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class SaveTokenDto {
  @IsInt()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  token: string;
}

export class PushMessageDto {
  @IsInt()
  @IsNotEmpty()
  memberId: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  body: string;
}
