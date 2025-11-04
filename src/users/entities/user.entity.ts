import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { StudentCard } from '../../student-card/entities/student-card.entity';

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

  @OneToMany(() => StudentCard, card => card.user)
  studentCards: StudentCard[];
}
