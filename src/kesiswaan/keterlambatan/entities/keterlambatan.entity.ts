import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Keterlambatan Entity
 * Menyimpan data keterlambatan siswa yang disinkronkan dari Walas
 */
@Entity('keterlambatan')
@Index(['studentId', 'date'])
@Index(['className'])
@Index(['date'])
@Index(['status'])
export class Keterlambatan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  studentId: number; // ID siswa di Walas

  @Column({ type: 'varchar', length: 255 })
  studentName: string; // Nama siswa

  @Column({ type: 'varchar', length: 100 })
  className: string; // Nama kelas (e.g., "X-A", "XI-B")

  @Column({ type: 'date' })
  date: string; // Tanggal keterlambatan (YYYY-MM-DD)

  @Column({ type: 'time' })
  time: string; // Jam masuk (HH:MM:SS)

  @Column({ type: 'int' })
  minutesLate: number; // Durasi terlambat dalam menit

  @Column({ type: 'varchar', length: 255, nullable: true })
  reason?: string; // Alasan keterlambatan

  @Column({
    type: 'enum',
    enum: ['recorded', 'verified', 'appealed', 'resolved'],
    default: 'recorded',
  })
  status: 'recorded' | 'verified' | 'appealed' | 'resolved'; // Status penanganan

  @Column({ type: 'int', nullable: true })
  walasId?: number; // ID Walas yang mencatat

  @Column({ type: 'varchar', length: 255, nullable: true })
  walasName?: string; // Nama Walas

  @Column({ type: 'text', nullable: true })
  verificationNotes?: string; // Catatan verifikasi

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'varchar', length: 50, default: 'sync' })
  source: string; // Sumber data (sync dari Walas atau manual)
}
