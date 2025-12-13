import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Reservasi } from './reservasi.entity';

@Entity('feedback')
export class Feedback {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  reservasiId: number;

  @OneToOne(() => Reservasi)
  @JoinColumn({ name: 'reservasiId' })
  reservasi: Reservasi;

  @Column()
  studentId: number;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'studentId' })
  student: User;

  @Column()
  counselorId: number;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'counselorId' })
  counselor: User;

  @Column('int')
  rating: number; // 1-5 stars

  @Column({ nullable: true })
  comment: string; // Optional feedback text

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
