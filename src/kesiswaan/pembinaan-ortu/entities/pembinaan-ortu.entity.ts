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
import { Pembinaan } from '../../pembinaan/entities/pembinaan.entity';
import { User } from '../../../users/entities/user.entity';

export type PembinaanOrtuStatus = 'pending' | 'sent' | 'read' | 'responded' | 'closed';

/**
 * Pembinaan Ortu Entity
 * Menyimpan notifikasi pemanggilan orang tua ke sekolah
 * Dibuat oleh kesiswaan untuk memberitahu orang tua tentang pelanggaran siswa
 */
@Entity('pembinaan_ortu')
@Index(['pembinaan_id'])
@Index(['student_id'])
@Index(['parent_id'])
@Index(['status'])
export class PembinaanOrtu {
  @PrimaryGeneratedColumn()
  id: number;

  // Relation to Pembinaan
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

  @Column({ type: 'varchar', length: 255 })
  student_class: string;

  // Parent information
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: User;

  @Column({ type: 'int', nullable: true })
  parent_id: number; // Parent user ID (jika sudah terdaftar)

  @Column({ type: 'varchar', length: 255 })
  parent_name: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  parent_phone: string; // Nomor kontak orang tua

  // Violation details
  @Column({ type: 'text' })
  violation_details: string; // Detail tentang pelanggaran

  @Column({ type: 'text' })
  letter_content: string; // Isi surat pemanggilan

  // Scheduled meeting
  @Column({ type: 'date' })
  scheduled_date: Date; // Jadwal pertemuan dengan orang tua

  @Column({ type: 'varchar', length: 5, nullable: true })
  scheduled_time: string; // Format: HH:MM

  @Column({ type: 'text', nullable: true })
  location: string; // Tempat pertemuan (ruang kepala sekolah, dll)

  // Status
  @Column({ type: 'enum', enum: ['pending', 'sent', 'read', 'responded', 'closed'], default: 'pending' })
  status: PembinaanOrtuStatus;

  // Kesiswaan staff notes
  @Column({ type: 'text', nullable: true })
  kesiswaan_notes: string;

  // Parent response
  @Column({ type: 'text', nullable: true })
  parent_response: string; // Respons orang tua

  @Column({ type: 'timestamp', nullable: true })
  parent_response_date: Date; // Tanggal orang tua merespons

  // Meeting result
  @Column({ type: 'text', nullable: true })
  meeting_result: string; // Hasil pertemuan

  @Column({ type: 'timestamp', nullable: true })
  meeting_date: Date; // Tanggal pertemuan terpenuhi

  // Follow-up
  @Column({ type: 'boolean', default: false })
  requires_follow_up: boolean;

  @Column({ type: 'text', nullable: true })
  follow_up_notes: string | null;

  // Communication tracking
  @Column({ type: 'varchar', default: 'sms' })
  communication_method: 'sms' | 'whatsapp' | 'email' | 'manual'; // Cara komunikasi

  @Column({ type: 'timestamp', nullable: true })
  sent_at: Date; // Waktu surat dikirim

  @Column({ type: 'timestamp', nullable: true })
  read_at: Date; // Waktu orang tua membaca (jika via digital)

  // Timeline
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  closedAt: Date; // Waktu kasus ditutup
}
