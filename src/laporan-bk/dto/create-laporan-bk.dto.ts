import { IsInt, IsString, IsOptional, IsEnum, IsBoolean, IsDateString, IsNumber } from 'class-validator';

export class CreateLaporanBkDto {
  @IsInt()
  reservasi_id: number;

  @IsInt()
  pembinaan_id: number;

  @IsInt()
  student_id: number;

  @IsOptional()
  @IsString()
  student_name?: string;

  @IsOptional()
  @IsString()
  student_class?: string;

  @IsInt()
  bk_id: number;

  @IsOptional()
  @IsDateString()
  session_date?: string;

  @IsOptional()
  @IsNumber()
  session_duration_minutes?: number;

  @IsOptional()
  @IsEnum(['individu', 'kelompok', 'keluarga'])
  session_type?: 'individu' | 'kelompok' | 'keluarga';

  @IsOptional()
  @IsString()
  session_location?: string;

  @IsOptional()
  @IsString()
  session_topic?: string;

  @IsOptional()
  @IsString()
  session_notes?: string;
}

export class UpdateLaporanBkDto {
  @IsOptional()
  @IsDateString()
  session_date?: string;

  @IsOptional()
  @IsNumber()
  session_duration_minutes?: number;

  @IsOptional()
  @IsEnum(['individu', 'kelompok', 'keluarga'])
  session_type?: 'individu' | 'kelompok' | 'keluarga';

  @IsOptional()
  @IsString()
  session_location?: string;

  @IsOptional()
  @IsString()
  session_topic?: string;

  @IsOptional()
  @IsString()
  session_notes?: string;

  @IsOptional()
  @IsString()
  student_response?: string;

  @IsOptional()
  @IsEnum(['sangat_memahami', 'memahami', 'cukup', 'kurang'])
  student_understanding_level?: 'sangat_memahami' | 'memahami' | 'cukup' | 'kurang';

  @IsOptional()
  @IsEnum(['sangat_aktif', 'aktif', 'cukup', 'pasif'])
  student_participation_level?: 'sangat_aktif' | 'aktif' | 'cukup' | 'pasif';

  @IsOptional()
  @IsBoolean()
  behavioral_improvement?: boolean;

  @IsOptional()
  @IsString()
  recommendations?: string;

  @IsOptional()
  @IsDateString()
  follow_up_date?: string;

  @IsOptional()
  @IsString()
  follow_up_status?: string;

  @IsOptional()
  @IsBoolean()
  parent_notified?: boolean;

  @IsOptional()
  @IsDateString()
  parent_notification_date?: string;

  @IsOptional()
  @IsString()
  parent_notification_content?: string;

  @IsOptional()
  @IsBoolean()
  escalated_to_waka?: boolean;

  @IsOptional()
  @IsString()
  escalation_reason?: string;

  @IsOptional()
  @IsEnum(['ongoing', 'completed', 'needs_escalation', 'archived'])
  status?: 'ongoing' | 'completed' | 'needs_escalation' | 'archived';

  @IsOptional()
  @IsString()
  final_assessment?: string;

  @IsOptional()
  @IsString()
  internal_notes?: string;
}

export class RecordSessionDto {
  @IsDateString()
  session_date: string;

  @IsOptional()
  @IsNumber()
  session_duration_minutes?: number;

  @IsOptional()
  @IsEnum(['individu', 'kelompok', 'keluarga'])
  session_type?: 'individu' | 'kelompok' | 'keluarga';

  @IsOptional()
  @IsString()
  session_location?: string;

  @IsString()
  session_topic: string;

  @IsString()
  session_notes: string;

  @IsOptional()
  @IsString()
  student_response?: string;

  @IsOptional()
  @IsEnum(['sangat_memahami', 'memahami', 'cukup', 'kurang'])
  student_understanding_level?: 'sangat_memahami' | 'memahami' | 'cukup' | 'kurang';

  @IsOptional()
  @IsEnum(['sangat_aktif', 'aktif', 'cukup', 'pasif'])
  student_participation_level?: 'sangat_aktif' | 'aktif' | 'cukup' | 'pasif';

  @IsOptional()
  @IsString()
  recommendations?: string;

  @IsOptional()
  @IsDateString()
  follow_up_date?: string;
}

export class EscalateToBkDto {
  @IsString()
  escalation_reason: string;

  @IsOptional()
  @IsString()
  final_assessment?: string;
}

export class CompleteFollowUpDto {
  @IsString()
  follow_up_status: string;

  @IsOptional()
  @IsString()
  follow_up_notes?: string;
}
