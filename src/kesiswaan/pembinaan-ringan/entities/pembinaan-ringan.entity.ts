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
import { Reservasi } from '../../../reservasi/entities/reservasi.entity';
import { Pembinaan } from '../../pembinaan/entities/pembinaan.entity';
import { User } from '../../../users/entities/user.entity';

export type PembinaanRinganStatus = 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';

/**
 * Pembinaan Ringan Entity
 * Menyimpan proses pembinaan ringan (ke BK/Konseling)
 * Dibuat dari reservasi dengan counselingType='khusus' dan pembinaanType='ringan'
 */
@Entity('pembinaan_ringan')
@Index(['reservasi_id'])
@Index(['pembinaan_id'])
@Index(['counselor_id'])
@Index(['status'])
export class PembinaanRingan {
  @PrimaryGeneratedColumn()
  id: number;

  // Relation to Reservasi (ringan type only)
  @OneToOne(() => Reservasi, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reservasi_id' })
  reservasi: Reservasi | null;

  @Column({ nullable: true })
  reservasi_id: number | null;

  // Relation to Pembinaan (for reference)
  @ManyToOne(() => Pembinaan, { nullable: false })
  @JoinColumn({ name: 'pembinaan_id' })
  pembinaan: Pembinaan;

  @Column()
  pembinaan_id: number;

  // Student information
  @Column({ type: 'int' })
  student_id: number;

  @Column({ type: 'varchar', length: 255 })
  student_name: string;

  // Counselor (BK) who will handle
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'counselor_id' })
  counselor: User;

  @Column()
  counselor_id: number;

  // Kesiswaan staff input
  @Column({ type: 'text' })
  hasil_pembinaan: string; // Hasil pembinaan dari kesiswaan

  @Column({ type: 'text' })
  catatan_bk: string; // Catatan khusus untuk BK

  // Schedule information
  @Column({ type: 'date' })
  scheduled_date: Date; // Jadwal konseling

  @Column({ type: 'varchar', length: 5 })
  scheduled_time: string; // Format: HH:MM

  // SP Information (Surat Peringatan)
  @Column({ type: 'varchar', length: 10, nullable: true })
  sp_level: 'SP1' | 'SP2' | null; // SP level (SP1, SP2), null jika pembinaan langsung tanpa SP

  // Status
  @Column({ type: 'enum', enum: ['pending', 'approved', 'rejected', 'in_progress', 'completed', 'cancelled'], default: 'pending' })
  status: PembinaanRinganStatus;

  // BK feedback
  @Column({ type: 'text', nullable: true })
  bk_feedback: string | null; // Feedback dari BK setelah konseling

  @Column({ type: 'text', nullable: true })
  bk_notes: string | null; // Catatan dari BK

  @Column({ type: 'timestamp', nullable: true })
  bk_decision_date: Date | null; // Waktu BK memberikan keputusan

  // Follow-up
  @Column({ type: 'boolean', default: false })
  has_follow_up: boolean;

  @Column({ type: 'text', nullable: true })
  follow_up_notes: string | null;

  // Timeline
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date | null; // Waktu BK approve

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date | null; // Waktu konseling selesai
}
