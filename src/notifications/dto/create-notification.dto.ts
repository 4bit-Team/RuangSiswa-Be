import { IsInt, IsString, IsEnum, IsOptional } from 'class-validator';
import type { NotificationType } from '../entities/notification.entity';

export class CreateNotificationDto {
  @IsInt()
  recipient_id: number;

  @IsEnum(['reservasi_approved', 'reservasi_rejected', 'session_recorded', 'escalation_to_waka', 'decision_made', 'parent_notification', 'general', 'pelanggaran_baru', 'sp_dibuat', 'reservasi_pembinaan_dibuat', 'pembinaan_disetujui'])
  type: NotificationType;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsInt()
  related_id?: number;

  @IsOptional()
  @IsString()
  related_type?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}

export class MarkAsReadDto {
  @IsInt()
  notification_id: number;
}

export class BulkMarkAsReadDto {
  @IsOptional()
  is_all?: boolean; // Mark all as read
}
