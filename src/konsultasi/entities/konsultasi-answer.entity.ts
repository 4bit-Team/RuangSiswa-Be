import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Konsultasi } from './konsultasi.entity';

@Entity('konsultasi_answers')
@Index('idx_konsultasi_answer_konsultasi', ['konsultasiId'])
@Index('idx_konsultasi_answer_author', ['authorId'])
@Index('idx_konsultasi_answer_verified', ['isVerified'])
export class KonsultasiAnswer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  konsultasiId: string;

  @ManyToOne(() => Konsultasi, konsultasi => konsultasi.answers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'konsultasiId' })
  konsultasi: Konsultasi;

  @Column('uuid')
  authorId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column('text')
  content: string;

  @Column({ default: 0 })
  votes: number;

  @Column('json', { default: '[]' })
  voters: Array<{ userId: string; vote: 1 | -1 }>;

  @Column({ default: false })
  isVerified: boolean;

  @Column('uuid', { nullable: true })
  verifiedBy: string | null;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date | null;

  @Column('text', { nullable: true })
  attachment: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
