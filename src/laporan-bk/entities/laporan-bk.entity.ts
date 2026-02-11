import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Reservasi } from '../../reservasi/entities/reservasi.entity';
import { Pembinaan } from '../../kesiswaan/pembinaan/entities/pembinaan.entity';
import { User } from '../../users/entities/user.entity';

export type LaporanStatus = 'ongoing' | 'completed' | 'needs_escalation' | 'archived';

@Entity('laporan_bk')
@Index(['reservasi_id'])
@Index(['pembinaan_id'])
@Index(['bk_id'])
@Index(['student_id'])
export class LaporanBk {
  @PrimaryGeneratedColumn()
  id: number;

  // Link to Reservasi (ringan type only)
  @OneToOne(() => Reservasi, { nullable: false })
  @JoinColumn({ name: 'reservasi_id' })
  reservasi: Reservasi;

  @Column()
  reservasi_id: number;

  // Link to Pembinaan (for reference)
  @ManyToOne(() => Pembinaan, { nullable: false })
  @JoinColumn({ name: 'pembinaan_id' })
  pembinaan: Pembinaan;

  @Column()
  pembinaan_id: number;

  // Student info
  @Column()
  student_id: number;

  @Column({ nullable: true })
  student_name: string;

  @Column({ nullable: true })
  student_class: string;

  // BK Counselor
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'bk_id' })
  bk: User;

  @Column()
  bk_id: number;

  // Session Information
  @Column({ nullable: true })
  session_date: Date;

  @Column({ nullable: true })
  session_duration_minutes: number; // Duration in minutes

  @Column({ type: 'enum', enum: ['individu', 'kelompok', 'keluarga'], nullable: true })
  session_type: 'individu' | 'kelompok' | 'keluarga'; // Type of counseling session

  @Column({ nullable: true })
  session_location: string; // e.g., "Ruang BK", "Kelas", etc

  // Session Details
  @Column({ type: 'text', nullable: true })
  session_topic: string; // What was discussed

  @Column({ type: 'text', nullable: true })
  session_notes: string; // Detailed notes from session

  // Student Response & Progress
  @Column({ type: 'text', nullable: true })
  student_response: string; // How student responded/participated

  @Column({ type: 'enum', enum: ['sangat_memahami', 'memahami', 'cukup', 'kurang'], nullable: true })
  student_understanding_level: 'sangat_memahami' | 'memahami' | 'cukup' | 'kurang'; // 1-4 scale

  @Column({ type: 'enum', enum: ['sangat_aktif', 'aktif', 'cukup', 'pasif'], nullable: true })
  student_participation_level: 'sangat_aktif' | 'aktif' | 'cukup' | 'pasif'; // 1-4 scale

  @Column({ nullable: true })
  behavioral_improvement: boolean; // Did behavior improve after counseling?

  // Follow-up & Recommendations
  @Column({ type: 'text', nullable: true })
  recommendations: string; // What recommendations were given

  @Column({ nullable: true })
  follow_up_date: Date; // When to follow up with student

  @Column({ type: 'text', nullable: true })
  follow_up_status: string; // Status of follow-up (e.g., "completed", "pending", "not needed")

  // Parent/Guardian Communication
  @Column({ default: false })
  parent_notified: boolean;

  @Column({ nullable: true })
  parent_notification_date: Date;

  @Column({ type: 'text', nullable: true })
  parent_notification_content: string; // What was communicated to parents

  // Escalation Tracking
  @Column({ default: false })
  escalated_to_waka: boolean; // Did this require escalation to WAKA?

  @Column({ nullable: true })
  escalation_reason: string; // Why it was escalated

  @Column({ nullable: true })
  escalation_date: Date;

  @Column({ nullable: true })
  bimbingan_pembina_id: number; // Reference to PembinaanWaka if escalated to WAKA

  // Status & Metadata
  @Column({ type: 'enum', enum: ['ongoing', 'completed', 'needs_escalation', 'archived'], default: 'ongoing' })
  status: LaporanStatus;

  @Column({ default: 0 })
  total_sessions: number; // Total sessions conducted

  @Column({ type: 'text', nullable: true })
  final_assessment: string; // Overall assessment at the end

  @Column({ type: 'text', nullable: true })
  internal_notes: string; // Admin/BK internal notes

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true })
  created_by: number;

  @Column({ nullable: true })
  updated_by: number;
}
