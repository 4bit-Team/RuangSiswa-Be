import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('kelas')
export class Kelas {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 10 })
  nama: string;

  @OneToMany(() => User, user => user.kelas)
  users: User[];
}
