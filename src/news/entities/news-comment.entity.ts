import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { News } from './news.entity';

@Entity('news_comments')
export class NewsComment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => News, (news) => news.comments, { onDelete: 'CASCADE' })
  news: News;

  @Column()
  newsId: number;

  @ManyToOne(() => User, { eager: true })
  author: User;

  @Column()
  authorId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
