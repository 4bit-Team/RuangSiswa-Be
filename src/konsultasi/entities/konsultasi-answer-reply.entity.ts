import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { KonsultasiAnswer } from './konsultasi-answer.entity';

@Entity('konsultasi_answer_replies')
@Index('idx_answer_reply_answer', ['answerId'])
@Index('idx_answer_reply_author', ['authorId'])
export class KonsultasiAnswerReply {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  answerId: string;

  @ManyToOne(() => KonsultasiAnswer, answer => answer.replies, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'answerId' })
  answer: KonsultasiAnswer;

  @Column()
  authorId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column('text')
  content: string;

  @Column({ default: 0 })
  votes: number;

  @Column({ default: 0 })
  downvotes: number;

  @Column('json', { default: '[]' })
  voters: Array<{ userId: number; vote: 1 | -1 }>;

  @Column({ default: false })
  isVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
