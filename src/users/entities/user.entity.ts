import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { StudentCard } from '../../student-card/entities/student-card.entity';
import { Kelas } from '../../kelas/entities/kelas.entity';
import { Jurusan } from '../../jurusan/entities/jurusan.entity';

export type UserRole = 'kesiswaan' | 'siswa' | 'admin' | 'bk';
export type UserStatus = 'aktif' | 'nonaktif';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: ['kesiswaan', 'siswa', 'admin', 'bk'], default: 'siswa' })
  role: UserRole;

  @Column({ type: 'enum', enum: ['aktif', 'nonaktif'], default: 'aktif' })
  status: UserStatus;


  @Column({ nullable: true })
  kartu_pelajar_file: string;

  // 🔹 Foreign Key Kelas
  @ManyToOne(() => Kelas, (kelas) => kelas.users, { nullable: true })
  @JoinColumn({ name: 'kelas_id' }) // ← ini penting
  kelas: Kelas;

  // 🔹 Foreign Key Jurusan
  @ManyToOne(() => Jurusan, (jurusan) => jurusan.users, { nullable: true })
  @JoinColumn({ name: 'jurusan_id' }) // ← ini penting
  jurusan: Jurusan;

  @OneToMany(() => StudentCard, card => card.user)
  studentCards: StudentCard[];
}
