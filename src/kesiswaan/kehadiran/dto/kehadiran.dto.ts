import { IsString, IsDate, IsEnum, IsOptional, IsNumber } from 'class-validator';

export class CreateKehadiranDto {
  @IsNumber()
  studentId: number;

  @IsString()
  studentName: string;

  @IsString()
  className: string;

  @IsString()
  date: string; // YYYY-MM-DD

  @IsEnum(['Hadir', 'Sakit', 'Izin', 'Alpa'])
  status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa';

  @IsOptional()
  @IsString()
  time?: string; // HH:MM:SS

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  walasId?: number;

  @IsOptional()
  @IsString()
  walasName?: string;

  @IsOptional()
  @IsString()
  source?: string;
}

export class UpdateKehadiranDto {
  @IsOptional()
  @IsEnum(['Hadir', 'Sakit', 'Izin', 'Alpa'])
  status?: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa';

  @IsOptional()
  @IsString()
  time?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class FilterKehadiranDto {
  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  studentId?: number;

  @IsOptional()
  @IsString()
  className?: string;

  @IsOptional()
  @IsEnum(['Hadir', 'Sakit', 'Izin', 'Alpa'])
  status?: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa';

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}
