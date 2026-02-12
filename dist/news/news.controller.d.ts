import { NewsService } from './news.service';
import { CreateNewsDto, NewsQueryDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
export declare class NewsController {
    private readonly newsService;
    constructor(newsService: NewsService);
    create(createNewsDto: CreateNewsDto, req: any): Promise<import("./entities/news.entity").News>;
    findAll(query: NewsQueryDto): Promise<{
        data: import("./entities/news.entity").News[];
        total: number;
    }>;
    findPublished(query: NewsQueryDto): Promise<{
        data: import("./entities/news.entity").News[];
        total: number;
    }>;
    getByCategory(category: string, page?: string, limit?: string): Promise<{
        data: import("./entities/news.entity").News[];
        total: number;
    }>;
    getUserNews(userId: string, page?: string, limit?: string): Promise<{
        data: import("./entities/news.entity").News[];
        total: number;
    }>;
    findOne(id: string): Promise<import("./entities/news.entity").News>;
    update(id: string, updateNewsDto: UpdateNewsDto, req: any): Promise<import("./entities/news.entity").News>;
    delete(id: string, req: any): Promise<{
        message: string;
    }>;
    toggleLike(id: string, req: any): Promise<{
        liked: boolean;
        message: string;
    }>;
    hasUserLiked(id: string, req: any): Promise<{
        liked: boolean;
    }>;
    getLikesCount(id: string): Promise<{
        count: number;
    }>;
    addComment(id: string, { content }: {
        content: string;
    }, req: any): Promise<import("./entities/news-comment.entity").NewsComment>;
    getComments(id: string, page?: string, limit?: string): Promise<{
        data: import("./entities/news-comment.entity").NewsComment[];
        total: number;
    }>;
    deleteComment(commentId: string, req: any): Promise<{
        message: string;
    }>;
    incrementViews(id: string): Promise<{
        message: string;
    }>;
}
