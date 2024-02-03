import { IsString, IsArray, IsUrl } from 'class-validator';

export class ExtensionHistoryDto {
  @IsUrl()
  url: string;

  @IsUrl()
  thumbnail: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsArray()
  @IsString({ each: true })
  tag: string[];

  @IsString()
  userId: string;
}
