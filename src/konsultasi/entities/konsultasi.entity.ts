import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, Index, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { KonsultasiAnswer } from './konsultasi-answer.entity';
import { ConsultationCategory } from '../../consultation-category/entities/consultation-category.entity';

@Entity('konsultasi')
@Index('idx_konsultasi_category', ['category'])
@Index('idx_konsultasi_author', ['authorId'])
@Index('idx_konsultasi_views_votes', ['views', 'votes'])
export class Konsultasi {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  content: string;

  // @Column({
  //   type: 'enum',
  //   enum: ['personal', 'academic', 'social', 'development'],
  // })
  // category: string;

  @ManyToOne(() => ConsultationCategory, { eager: true })
  @JoinColumn({ name: 'categoryId' })
  category: ConsultationCategory;

  @Column()
  categoryId: number;

  @Column('uuid')
  authorId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column({ default: 0 })
  views: number;

  @Column({ default: 0 })
  votes: number;

  @Column('json', { default: '[]' })
  voters: Array<{ userId: string; vote: 1 | -1 }>;

  @Column({ default: 0 })
  answerCount: number;

  @Column({ default: false })
  isResolved: boolean;

  @OneToMany(() => KonsultasiAnswer, answer => answer.konsultasi, { cascade: true })
  answers: KonsultasiAnswer[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
