import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Kehadiran Entity
 * Menyimpan data kehadiran siswa yang disinkronkan dari Walas
 */
@Entity('kehadiran')
@Index(['studentId', 'date'])
@Index(['className'])
@Index(['date'])
@Index(['status'])
export class Kehadiran {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  studentId: number; // ID siswa di Walas

  @Column({ type: 'varchar', length: 255 })
  studentName: string; // Nama siswa

  @Column({ type: 'varchar', length: 100 })
  className: string; // Nama kelas (e.g., "X-A", "XI-B")

  @Column({ type: 'date' })
  date: string; // Tanggal kehadiran (YYYY-MM-DD)

  @Column({
    type: 'enum',
    enum: ['Hadir', 'Sakit', 'Izin', 'Alpa'],
    default: 'Hadir',
  })
  status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa'; // Status kehadiran

  @Column({ type: 'time', nullable: true })
  time?: string; // Jam hadir (HH:MM:SS)

  @Column({ type: 'varchar', length: 500, nullable: true })
  notes?: string; // Catatan tambahan

  @Column({ type: 'int', nullable: true })
  walasId?: number; // ID Walas yang mencatat

  @Column({ type: 'varchar', length: 255, nullable: true })
  walasName?: string; // Nama Walas

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'varchar', length: 50, default: 'sync' })
  source: string; // Sumber data (sync dari Walas atau manual)
}
