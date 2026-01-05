import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Jurusan } from '../../jurusan/entities/jurusan.entity';

@Entity('bk_jurusan')
@Index(['bkId', 'jurusanId'], { unique: true })
export class BkJurusan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  bkId: number; // Reference ke user dengan role 'bk'

  @ManyToOne(() => User, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bkId' })
  bk: User;

  @Column()
  jurusanId: number;

  @ManyToOne(() => Jurusan, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'jurusanId' })
  jurusan: Jurusan;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
