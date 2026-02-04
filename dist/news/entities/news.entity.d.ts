import { User } from '../../users/entities/user.entity';
import { NewsLike } from './news-like.entity';
import { NewsComment } from './news-comment.entity';
import { NewsCategory } from '../../news-category/entities/news-category.entity';
export type NewsStatus = 'draft' | 'published' | 'scheduled';
export declare class News {
    id: number;
    title: string;
    summary: string;
    content: string;
    imageUrl?: string;
    categories: NewsCategory[];
    status: NewsStatus;
    viewCount: number;
    publishedDate: Date;
    scheduledDate: Date;
    author: User;
    authorId: number;
    likes: NewsLike[];
    comments: NewsComment[];
    createdAt: Date;
    updatedAt: Date;
}
