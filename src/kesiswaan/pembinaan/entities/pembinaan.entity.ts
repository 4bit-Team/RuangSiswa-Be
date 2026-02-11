import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PointPelanggaran } from '../../point-pelanggaran/entities/point-pelanggaran.entity';

/**
 * Pembinaan Entity
 * Menyimpan record pembinaan siswa yang diterima dari WALASU
 * Terlink dengan point pelanggaran untuk kategorisasi dan tracking
 */
@Entity('pembinaan')
@Index(['siswas_id'])
@Index(['walas_id'])
@Index(['point_pelanggaran_id'])
@Index(['status'])
@Index(['tanggal_pembinaan', 'siswas_id'])
export class Pembinaan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  walas_id: number; // ID Walas dari WALASU

  @Column({ type: 'varchar', length: 255 })
  walas_name: string; // Nama Walas (cached)

  @Column({ type: 'int' })
  siswas_id: number; // ID Siswa dari WALASU

  @Column({ type: 'varchar', length: 255 })
  siswas_name: string; // Nama Siswa (cached)

  @Column({ type: 'int', nullable: true })
  point_pelanggaran_id: number; // FK to point_pelanggaran (dapat null jika tidak ada match)

  @ManyToOne(() => PointPelanggaran, { nullable: true, eager: true })
  @JoinColumn({ name: 'point_pelanggaran_id' })
  pointPelanggaran: PointPelanggaran;

  @Column({ type: 'varchar', length: 255 })
  kasus: string; // Deskripsi kasus dari WALASU

  @Column({ type: 'varchar', length: 255 })
  tindak_lanjut: string; // Tindak lanjut dari WALASU

  @Column({ type: 'text' })
  keterangan: string; // Keterangan detail dari WALASU

  @Column({ type: 'date' })
  tanggal_pembinaan: string; // YYYY-MM-DD - Tanggal pembinaan terjadi

  @Column({ type: 'varchar', length: 100, default: 'pending' })
  status: string; // pending, in_progress, completed, archived

  @Column({ type: 'varchar', length: 50, nullable: true })
  match_type: string; // exact, keyword, manual, none - Tipe matching dengan point_pelanggaran

  @Column({ type: 'int', default: 0 })
  match_confidence: number; // 0-100 - Confidence score untuk match

  @Column({ type: 'text', nullable: true })
  match_explanation: string; // Penjelasan hasil matching

  @Column({ type: 'varchar', length: 50, nullable: true })
  class_id: number; // Kelas siswa (cached)

  @Column({ type: 'varchar', length: 100, nullable: true })
  class_name: string; // Nama kelas (cached)

  @Column({ type: 'text', nullable: true })
  hasil_pembinaan: string; // Hasil akhir pembinaan

  @Column({ type: 'text', nullable: true })
  catatan_bk: string; // Catatan dari BK/Kesiswaan

  @Column({ type: 'varchar', length: 50, nullable: true })
  follow_up_type: string; // follow_up, closed, escalated

  @Column({ type: 'date', nullable: true })
  follow_up_date: string; // Tanggal follow up jika ada

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
