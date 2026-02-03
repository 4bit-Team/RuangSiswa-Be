import { IsString, IsOptional, IsIn } from 'class-validator';

export class FilterKonsultasiDto {
  @IsString()
  @IsOptional()
  @IsIn(['personal', 'academic', 'social', 'development', 'all'])
  category?: string;

  @IsString()
  @IsOptional()
  @IsIn(['trending', 'newest', 'unanswered'])
  sort?: string;

  @IsString()
  @IsOptional()
  search?: string;
}
