import { User } from '../../users/entities/user.entity';
import { News } from './news.entity';
export declare class NewsLike {
    id: number;
    news: News;
    newsId: number;
    user: User;
    userId: number;
    createdAt: Date;
}
