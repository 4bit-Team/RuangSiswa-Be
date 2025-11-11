import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('jurusan')
export class Jurusan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nama: string;

  @Column({ length: 10 })
  kode: string;

  @OneToMany(() => User, user => user.jurusan)
  users: User[];
}
