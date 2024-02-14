import { IsDate, IsNotEmpty } from 'class-validator';

export class GrassDto {
  @IsDate()
  @IsNotEmpty()
  date: Date;
}

export class GrassStreamDto {
  // userId: number;
  count: number;
  grass: number;
  teamCode: string;
}
