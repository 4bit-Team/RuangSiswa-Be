import { IsString, IsNotEmpty, IsIn, IsOptional, IsArray, IsBoolean } from 'class-validator';

export class CreateKonsultasiDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['personal', 'academic', 'social', 'development'])
  category: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsBoolean()
  @IsOptional()
  isResolved?: boolean;
}
