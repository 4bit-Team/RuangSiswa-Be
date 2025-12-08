import { IsString, IsNotEmpty, IsArray, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { NewsCategory } from '../entities/news.entity';

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

  @IsArray()
  @IsEnum(['Akademik', 'Kesehatan Mental', 'Karir', 'Pengembangan Diri', 'Sosial', 'Pengumuman'], {
    each: true,
  })
  categories: NewsCategory[];

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

export class UpdateNewsDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  summary?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsArray()
  @IsEnum(['Akademik', 'Kesehatan Mental', 'Karir', 'Pengembangan Diri', 'Sosial', 'Pengumuman'], {
    each: true,
  })
  @IsOptional()
  categories?: NewsCategory[];

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsEnum(['draft', 'published', 'scheduled'])
  @IsOptional()
  status?: 'draft' | 'published' | 'scheduled';

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
  category?: string;

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