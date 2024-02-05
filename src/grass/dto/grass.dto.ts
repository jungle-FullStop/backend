import { IsDate, IsNotEmpty } from 'class-validator';

export class GrassDto {
  @IsDate()
  @IsNotEmpty()
  date: Date;
}
