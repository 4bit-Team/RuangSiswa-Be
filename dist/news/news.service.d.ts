import { Repository } from 'typeorm';
import { News } from './entities/news.entity';
import { NewsLike } from './entities/news-like.entity';
import { NewsComment } from './entities/news-comment.entity';
import { NewsCategory } from '../news-category/entities/news-category.entity';
import { CreateNewsDto, NewsQueryDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { User } from '../users/entities/user.entity';
export declare class NewsService {
    private newsRepository;
    private newsLikeRepository;
    private newsCommentRepository;
    private newsCategoryRepository;
    private userRepository;
    private scheduledJobs;
    constructor(newsRepository: Repository<News>, newsLikeRepository: Repository<NewsLike>, newsCommentRepository: Repository<NewsComment>, newsCategoryRepository: Repository<NewsCategory>, userRepository: Repository<User>);
    private initializeScheduledNews;
    private scheduleNewsPublishing;
    private publishScheduledNews;
    create(createNewsDto: CreateNewsDto, userId: number): Promise<News>;
    findAll(query?: NewsQueryDto): Promise<{
        data: News[];
        total: number;
    }>;
    findPublished(query?: NewsQueryDto): Promise<{
        data: News[];
        total: number;
    }>;
    findOne(id: number): Promise<News>;
    update(id: number, updateNewsDto: UpdateNewsDto, userId: number): Promise<News>;
    delete(id: number, userId: number): Promise<void>;
    toggleLike(newsId: number, userId: number): Promise<boolean>;
    getLikesCount(newsId: number): Promise<number>;
    hasUserLiked(newsId: number, userId: number): Promise<boolean>;
    addComment(newsId: number, userId: number, content: string): Promise<NewsComment>;
    deleteComment(commentId: number, userId: number): Promise<void>;
    getComments(newsId: number, page?: number, limit?: number): Promise<{
        data: NewsComment[];
        total: number;
    }>;
    getByCategory(category: NewsCategory, page?: number, limit?: number): Promise<{
        data: News[];
        total: number;
    }>;
    getUserNews(userId: number, page?: number, limit?: number): Promise<{
        data: News[];
        total: number;
    }>;
    incrementViews(id: number): Promise<News>;
}
