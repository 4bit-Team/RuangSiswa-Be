import { IsString, IsNotEmpty, IsArray, IsEnum, IsOptional, IsDateString, IsNumber } from 'class-validator';

export class CreateNewsDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  summary: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  // @IsArray()
  // @IsEnum(['Akademik', 'Kesehatan Mental', 'Karir', 'Pengembangan Diri', 'Sosial', 'Pengumuman'], {
  //   each: true,
  // })
  // categories: NewsCategory[];
  @IsArray()
  @IsNumber({}, { each: true })
  categoryIds: number[];

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(['draft', 'published', 'scheduled'])
  status: 'draft' | 'published' | 'scheduled';

  @IsDateString()
  @IsOptional()
  scheduledDate?: string;
}

export class NewsQueryDto {
  @IsString()
  @IsOptional()
  status?: 'draft' | 'published' | 'scheduled';

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  sortBy?: 'newest' | 'oldest' | 'mostViewed';

  @IsString()
  @IsOptional()
  page?: string;

  @IsString()
  @IsOptional()
  limit?: string;
}