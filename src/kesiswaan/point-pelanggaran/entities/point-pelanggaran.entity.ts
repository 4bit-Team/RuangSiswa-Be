import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Point Pelanggaran Entity
 * Master data untuk Tata Tertib Siswa dengan sistem poin
 * Menyimpan daftar pelanggaran dan bobot poin untuk setiap tahun ajaran
 */
@Entity('point_pelanggaran')
@Index(['tahun_point', 'isActive'])
@Index(['category_point'])
@Index(['kode'])
export class PointPelanggaran {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  tahun_point: number; // Tahun ajaran (e.g., 2025, 2026)

  @Column({ type: 'varchar', length: 100 })
  category_point: string; // Kategori pelanggaran (e.g., "Ketertiban", "Kehadiran", "Pakaian", "Kepribadian")

  @Column({ type: 'varchar', length: 255 })
  nama_pelanggaran: string; // Nama/deskripsi pelanggaran (e.g., "Terlambat datang", "Membolos", "Merokok")

  @Column({ type: 'varchar', length: 50, unique: true })
  kode: string; // Kode unik pelanggaran dari PDF (e.g., "A.1", "D.10.5", "K.2")

  @Column({ type: 'int' })
  bobot: number; // Bobot poin untuk pelanggaran ini (e.g., 5, 10, 25, 50)

  @Column({ type: 'boolean', default: false })
  isActive: boolean; // Menandakan apakah tahun point ini adalah tahun yang aktif (hanya 1 yang bisa true)

  @Column({ type: 'boolean', default: false })
  isSanksi: boolean; // Untuk Sanksi - apakah pelanggaran ini termasuk kategori yang perlu sanksi

  @Column({ type: 'boolean', default: false })
  isDo: boolean; // Untuk Drop Out / Mutasi - apakah pelanggaran ini bisa menyebabkan DO/mutasi

  @Column({ type: 'text', nullable: true })
  deskripsi: string; // Deskripsi detail tentang pelanggaran

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
