import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn, Index, Unique } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Konsultasi } from './konsultasi.entity';

@Entity('konsultasi_bookmark')
@Index('idx_konsultasi_bookmark_user', ['userId'])
@Index('idx_konsultasi_bookmark_question', ['konsultasiId'])
@Unique('uq_konsultasi_bookmark_user_question', ['userId', 'konsultasiId'])
export class KonsultasiBookmark {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('uuid')
  konsultasiId: string;

  @ManyToOne(() => Konsultasi, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'konsultasiId' })
  konsultasi: Konsultasi;

  @CreateDateColumn()
  createdAt: Date;
}
