import { IsString, IsArray, IsUrl } from 'class-validator';

export class ExtensionHistoryDto {
  @IsUrl()
  url: string;

  @IsString()
  title: string;

  @IsArray()
  @IsString({ each: true })
  tag: string[];

  @IsString()
  userId: string;
}
