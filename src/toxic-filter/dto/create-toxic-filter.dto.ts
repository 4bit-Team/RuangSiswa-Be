import { IsString, IsEnum, IsBoolean, IsOptional, Length } from 'class-validator';

export enum SeverityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export class CreateToxicFilterDto {
  @IsString()
  @Length(1, 100)
  word: string;

  @IsEnum(SeverityLevel)
  @IsOptional()
  severity?: SeverityLevel;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  replacement?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  description?: string;
}
