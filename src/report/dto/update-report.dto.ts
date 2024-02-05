import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateReportDto {
  @IsString()
  @IsNotEmpty()
  message: string;
}
