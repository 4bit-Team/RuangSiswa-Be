import { IsString, IsOptional, IsBoolean, Length } from 'class-validator';

export class CreateEmojiDto {
  @IsString()
  @Length(1, 10)
  emoji: string;

  @IsString()
  @Length(1, 100)
  name: string;

  @IsString()
  @IsOptional()
  @Length(1, 50)
  category?: string;

  @IsString()
  @IsOptional()
  keywords?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}