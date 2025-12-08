import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { NewsLike } from './news-like.entity';
import { NewsComment } from './news-comment.entity';

export type NewsStatus = 'draft' | 'published' | 'scheduled';
export type NewsCategory =
  | 'Akademik'
  | 'Kesehatan Mental'
  | 'Karir'
  | 'Pengembangan Diri'
  | 'Sosial'
  | 'Pengumuman';

@Entity('news')
export class News {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  summary: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ type: 'simple-array' })
  categories: NewsCategory[];

  @Column({ type: 'enum', enum: ['draft', 'published', 'scheduled'], default: 'draft' })
  status: NewsStatus;

  @Column({ default: 0 })
  viewCount: number;

  @Column({ nullable: true, type: 'timestamp' })
  publishedDate: Date;

  @Column({ nullable: true, type: 'timestamp' })
  scheduledDate: Date;

  @ManyToOne(() => User, (user) => user.newsArticles, { eager: true })
  author: User;

  @Column()
  authorId: number;

  @OneToMany(() => NewsLike, (like) => like.news, { cascade: true })
  likes: NewsLike[];

  @OneToMany(() => NewsComment, (comment) => comment.news, { cascade: true })
  comments: NewsComment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
