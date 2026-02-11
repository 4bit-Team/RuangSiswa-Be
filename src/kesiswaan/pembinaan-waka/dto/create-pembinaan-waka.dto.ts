import { IsInt, IsString, IsOptional, IsEnum, IsBoolean, IsDateString } from 'class-validator';

export type WakDecision = 'sp3' | 'do';

export class CreatePembinaanWakaDto {
  @IsInt()
  reservasi_id: number;

  @IsInt()
  pembinaan_id: number;

  @IsInt()
  waka_id: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class DecidePembinaanWakaDto {
  @IsEnum(['sp3', 'do'])
  wak_decision: WakDecision;

  @IsString()
  decision_reason: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class AcknowledgePembinaanWakaDto {
  @IsBoolean()
  acknowledged: boolean;

  @IsOptional()
  @IsString()
  student_response?: string;
}

export class AppealPembinaanWakaDto {
  @IsString()
  appeal_reason: string;

  @IsOptional()
  @IsString()
  additional_notes?: string;
}

export class NotifyParentDto {
  @IsOptional()
  @IsString()
  notification_message?: string;
}

export class UpdatePembinaanWakaDto {
  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  parent_notified?: boolean;

  @IsOptional()
  @IsDateString()
  parent_notification_date?: string;
}
