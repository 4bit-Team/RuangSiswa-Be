import { User } from '../../users/entities/user.entity';
import { News } from './news.entity';
export declare class NewsComment {
    id: number;
    content: string;
    news: News;
    newsId: number;
    author: User;
    authorId: number;
    createdAt: Date;
    updatedAt: Date;
}
