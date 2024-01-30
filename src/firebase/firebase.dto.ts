import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class SaveTokenDto {
  @IsInt()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  token: string;
}
