import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Kelas } from '../../kelas/entities/kelas.entity';
import { Jurusan } from '../../jurusan/entities/jurusan.entity';

export type StatusPerkembanganPesertaDidik = 'Membaik' | 'Stabil' | 'Menurun' | 'Belum Terlihat Perubahan';

@Entity('laporan_bk')
export class LaporanBk {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  namaKonseling: string;

  @Column({ nullable: true })
  jurusanId: number;

  @Column({ nullable: true })
  kelasId: number;

  @Column({ type: 'date' })
  tanggalDiprosesAiBk: Date;

  @Column({ type: 'text' })
  deskripsiKasusMasalah: string;

  @Column({ type: 'text', nullable: true })
  bentukPenanganganSebelumnya: string;

  @Column({ type: 'text', nullable: true })
  riwayatSpDanKasus: string;

  @Column({ type: 'text', nullable: true })
  layananBk: string;

  @Column({ type: 'text', nullable: true })
  followUpTindakanBk: string;

  @Column({ type: 'text', nullable: true })
  penahanganGuruBkKonselingProsesPembinaan: string;

  @Column({ type: 'text', nullable: true })
  pertemuanKe1: string;

  @Column({ type: 'text', nullable: true })
  pertemuanKe2: string;

  @Column({ type: 'text', nullable: true })
  pertemuanKe3: string;

  @Column({ type: 'text', nullable: true })
  hasilPemantauanKeterangan: string;

  @Column({ nullable: true })
  guruBkYangMenanganiId: number;

  @Column({
    type: 'enum',
    enum: ['Membaik', 'Stabil', 'Menurun', 'Belum Terlihat Perubahan'],
    nullable: true,
  })
  statusPerkembanganPesertaDidik: StatusPerkembanganPesertaDidik;

  @Column({ type: 'text', nullable: true })
  keteranganKetersedianDokumen: string;

  @ManyToOne(() => Jurusan, { eager: true, nullable: true })
  jurusan: Jurusan;

  @ManyToOne(() => Kelas, { eager: true, nullable: true })
  kelas: Kelas;

  @ManyToOne(() => User, { eager: true, nullable: true })
  guruBkYangMenanganis: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
