import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CounselingCategory } from '../../counseling-category/entities/counseling-category.entity';
import { Pembinaan } from '../../kesiswaan/pembinaan/entities/pembinaan.entity';

@Entity('reservasi')
export class Reservasi {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  studentId: number;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'studentId' })
  student: User;

  @Column({ type: 'int' })
  counselorId: number;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'counselorId' })
  counselor: User;

  @Column({ type: 'timestamp' })
  preferredDate: Date;

  @Column({ type: 'varchar' })
  preferredTime: string; // Format: HH:MM

  @Column({ type: 'varchar', default: 'chat' })
  type: 'chat' | 'tatap-muka'; // Tipe sesi

  @Column({ type: 'varchar', default: 'umum' })
  counselingType: 'umum' | 'kelompok' | 'khusus'; // Tipe konseling (umum, kelompok, khusus/pembinaan)

  @Column({ type: 'varchar', nullable: true })
  pembinaanType: 'ringan' | 'berat' | null; // Tipe pembinaan (ringan=BK, berat=WAKA), hanya jika counselingType='khusus'

  @ManyToOne(() => CounselingCategory, { eager: true })
  @JoinColumn({ name: 'topicId' })
  topic: CounselingCategory;

  @Column({ type: 'int', nullable: true })
  topicId: number;

  @ManyToOne(() => Pembinaan, { eager: false, nullable: true })
  @JoinColumn({ name: 'pembinaan_id' })
  pembinaan: Pembinaan;

  @Column({ type: 'int', nullable: true })
  pembinaan_id: number; // Reference ke Pembinaan record (untuk konseling khusus)

  // OneToOne relation to PembinaanWaka (for berat type coaching)
  @OneToOne('PembinaanWaka', 'reservasi', { nullable: true, eager: false })
  pembinaanWaka: any;

  @Column({ type: 'text', nullable: true })
  notes: string; // Catatan dari siswa

  @Column({ type: 'varchar', default: 'pending' })
  status: 'pending' | 'approved' | 'rejected' | 'in_counseling' | 'completed' | 'cancelled';

  @Column({ type: 'int', nullable: true })
  conversationId: number; // Referensi ke conversation yang dibuat saat approved

  @Column({ type: 'text', nullable: true })
  rejectionReason: string; // Alasan jika ditolak

  @Column({ type: 'varchar', nullable: true })
  room: string; // Ruang untuk tatap muka

  @Column({ type: 'text', nullable: true })
  qrCode: string; // QR code untuk attendance tatap muka

  @Column({ type: 'boolean', default: false })
  attendanceConfirmed: boolean; // Apakah sudah absen via QR scan

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date; // Waktu sesi selesai

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
