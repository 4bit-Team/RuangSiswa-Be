import { IsString, IsNotEmpty, IsOptional, IsArray, IsBoolean, IsNumber } from 'class-validator';

export class CreateKonsultasiDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  // @IsString()
  // @IsNotEmpty()
  // @IsIn(['personal', 'academic', 'social', 'development'])
  // category: string;

  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsBoolean()
  @IsOptional()
  isResolved?: boolean;
}
