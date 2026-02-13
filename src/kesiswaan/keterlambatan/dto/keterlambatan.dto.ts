import { IsString, IsEnum, IsOptional, IsNumber, IsInt, Min, Max } from 'class-validator';

export class CreateKeterlambatanDto {
  @IsNumber()
  studentId: number;

  @IsString()
  studentName: string;

  @IsString()
  className: string;

  @IsString()
  date: string; // YYYY-MM-DD

  @IsString()
  time: string; // HH:MM:SS

  @IsInt()
  @Min(1)
  minutesLate: number;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsEnum(['recorded', 'verified', 'appealed', 'resolved'])
  status?: 'recorded' | 'verified' | 'appealed' | 'resolved';

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

export class UpdateKeterlambatanDto {
  @IsOptional()
  @IsEnum(['recorded', 'verified', 'appealed', 'resolved'])
  status?: 'recorded' | 'verified' | 'appealed' | 'resolved';

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  verificationNotes?: string;
}

export class FilterKeterlambatanDto {
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
  @IsEnum(['recorded', 'verified', 'appealed', 'resolved'])
  status?: 'recorded' | 'verified' | 'appealed' | 'resolved';

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}
