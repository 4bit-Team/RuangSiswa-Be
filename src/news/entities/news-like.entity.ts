import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { News } from './news.entity';

@Entity('news_likes')
export class NewsLike {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => News, (news) => news.likes, { onDelete: 'CASCADE' })
  news: News;

  @Column()
  newsId: number;

  @ManyToOne(() => User, { eager: true })
  user: User;

  @Column()
  userId: number;

  @CreateDateColumn()
  createdAt: Date;
}
