import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export type NotificationType = 
  | 'reservasi_approved' 
  | 'reservasi_rejected'
  | 'session_recorded'
  | 'escalation_to_waka'
  | 'decision_made'
  | 'parent_notification'
  | 'general'
  | 'pelanggaran_baru'
  | 'sp_dibuat'
  | 'reservasi_pembinaan_dibuat'
  | 'pembinaan_disetujui';

export type NotificationStatus = 'unread' | 'read' | 'archived';

@Entity('notifications')
@Index(['recipient_id'])
@Index(['created_at'])
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  // Recipient of the notification
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'recipient_id' })
  recipient: User;

  @Column({ type: 'int' })
  recipient_id: number;

  // Notification type
  @Column({ type: 'enum', enum: ['reservasi_approved', 'reservasi_rejected', 'session_recorded', 'escalation_to_waka', 'decision_made', 'parent_notification', 'general', 'pelanggaran_baru', 'sp_dibuat', 'reservasi_pembinaan_dibuat', 'pembinaan_disetujui'] })
  type: NotificationType;

  // Notification content
  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'int', nullable: true })
  related_id: number; // ID of related entity (reservasi, laporan-bk, pembinaan-waka, etc)

  @Column({ type: 'varchar', nullable: true })
  related_type: string; // Type of related entity (reservasi, laporan-bk, pembinaan-waka)

  // Status
  @Column({ type: 'enum', enum: ['unread', 'read', 'archived'], default: 'unread' })
  status: NotificationStatus;

  @Column({ type: 'timestamp', nullable: true })
  read_at: Date;

  // Metadata
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'simple-json', nullable: true })
  metadata: Record<string, any>; // Store additional data like student name, kasus, etc
}
