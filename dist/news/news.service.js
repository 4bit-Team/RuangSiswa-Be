"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const news_entity_1 = require("./entities/news.entity");
const news_like_entity_1 = require("./entities/news-like.entity");
const news_comment_entity_1 = require("./entities/news-comment.entity");
const news_category_entity_1 = require("../news-category/entities/news-category.entity");
const user_entity_1 = require("../users/entities/user.entity");
const schedule = __importStar(require("node-schedule"));
let NewsService = class NewsService {
    newsRepository;
    newsLikeRepository;
    newsCommentRepository;
    newsCategoryRepository;
    userRepository;
    scheduledJobs = new Map();
    constructor(newsRepository, newsLikeRepository, newsCommentRepository, newsCategoryRepository, userRepository) {
        this.newsRepository = newsRepository;
        this.newsLikeRepository = newsLikeRepository;
        this.newsCommentRepository = newsCommentRepository;
        this.newsCategoryRepository = newsCategoryRepository;
        this.userRepository = userRepository;
        this.initializeScheduledNews();
    }
    async initializeScheduledNews() {
        const scheduledNews = await this.newsRepository.find({
            where: { status: 'scheduled' },
        });
        scheduledNews.forEach((news) => {
            this.scheduleNewsPublishing(news.id, news.scheduledDate);
        });
    }
    scheduleNewsPublishing(newsId, scheduledDate) {
        const job = schedule.scheduleJob(scheduledDate, async () => {
            await this.publishScheduledNews(newsId);
            this.scheduledJobs.delete(newsId);
        });
        this.scheduledJobs.set(newsId, job);
    }
    async publishScheduledNews(newsId) {
        const news = await this.newsRepository.findOne({ where: { id: newsId } });
        if (news) {
            news.status = 'published';
            news.publishedDate = new Date();
            await this.newsRepository.save(news);
        }
    }
    async create(createNewsDto, userId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.role !== 'bk' && user.role !== 'admin') {
            throw new common_1.ForbiddenException('Only BK staff and admin can create news');
        }
        if (createNewsDto.status === 'scheduled') {
            if (!createNewsDto.scheduledDate) {
                throw new common_1.BadRequestException('Scheduled date is required for scheduled news');
            }
            const scheduledDate = new Date(createNewsDto.scheduledDate);
            if (isNaN(scheduledDate.getTime())) {
                throw new common_1.BadRequestException('Invalid scheduled date format');
            }
        }
        let categories = [];
        if (createNewsDto.categoryIds && createNewsDto.categoryIds.length > 0) {
            categories = await this.newsCategoryRepository.find({
                where: { id: (0, typeorm_2.In)(createNewsDto.categoryIds) },
            });
            if (categories.length !== createNewsDto.categoryIds.length) {
                throw new common_1.BadRequestException('One or more categories not found');
            }
        }
        const news = this.newsRepository.create({
            title: createNewsDto.title,
            summary: createNewsDto.summary,
            content: createNewsDto.content,
            authorId: userId,
            status: createNewsDto.status,
            publishedDate: createNewsDto.status === 'published' ? new Date() : undefined,
            scheduledDate: createNewsDto.status === 'scheduled' && createNewsDto.scheduledDate
                ? new Date(createNewsDto.scheduledDate)
                : undefined,
            categories,
        });
        news.author = user;
        const savedNews = await this.newsRepository.save(news);
        if (createNewsDto.status === 'scheduled' && news.scheduledDate) {
            this.scheduleNewsPublishing(savedNews.id, news.scheduledDate);
        }
        return savedNews;
    }
    async findAll(query = {}) {
        const page = parseInt(query.page ?? '1') || 1;
        const limit = parseInt(query.limit ?? '10') || 10;
        const skip = (page - 1) * limit;
        let whereCondition = {};
        if (query.status) {
            whereCondition.status = query.status;
        }
        if (query.search) {
            whereCondition = [
                { ...whereCondition, title: (0, typeorm_2.Like)(`%${query.search}%`) },
                { ...whereCondition, summary: (0, typeorm_2.Like)(`%${query.search}%`) },
                { ...whereCondition, content: (0, typeorm_2.Like)(`%${query.search}%`) },
            ];
        }
        let orderBy = { createdAt: 'DESC' };
        if (query.sortBy === 'oldest') {
            orderBy = { createdAt: 'ASC' };
        }
        else if (query.sortBy === 'mostViewed') {
            orderBy = { viewCount: 'DESC' };
        }
        const [data, total] = await this.newsRepository.findAndCount({
            where: whereCondition,
            skip,
            take: limit,
            order: orderBy,
            relations: ['author', 'categories', 'likes', 'comments'],
        });
        return { data, total };
    }
    async findPublished(query = {}) {
        const publishedQuery = { ...query, status: 'published' };
        return this.findAll(publishedQuery);
    }
    async findOne(id) {
        const news = await this.newsRepository.findOne({
            where: { id },
            relations: ['author', 'categories', 'likes', 'comments', 'comments.author'],
        });
        if (!news) {
            throw new common_1.NotFoundException('News not found');
        }
        news.viewCount += 1;
        await this.newsRepository.save(news);
        return news;
    }
    async update(id, updateNewsDto, userId) {
        const news = await this.newsRepository.findOne({
            where: { id },
            relations: ['author'],
        });
        if (!news) {
            throw new common_1.NotFoundException('News not found');
        }
        if (news.authorId !== userId) {
            throw new common_1.ForbiddenException('You can only edit your own news');
        }
        if (updateNewsDto.categoryIds && updateNewsDto.categoryIds.length > 0) {
            const categories = await this.newsCategoryRepository.find({
                where: { id: (0, typeorm_2.In)(updateNewsDto.categoryIds) },
            });
            if (categories.length !== updateNewsDto.categoryIds.length) {
                throw new common_1.BadRequestException('One or more categories not found');
            }
            news.categories = categories;
        }
        if (updateNewsDto.status === 'scheduled' &&
            updateNewsDto.scheduledDate) {
            this.scheduleNewsPublishing(id, new Date(updateNewsDto.scheduledDate));
        }
        if (updateNewsDto.status === 'published' && news.status !== 'published') {
            news.publishedDate = new Date();
        }
        if (updateNewsDto.title)
            news.title = updateNewsDto.title;
        if (updateNewsDto.summary)
            news.summary = updateNewsDto.summary;
        if (updateNewsDto.content)
            news.content = updateNewsDto.content;
        if (updateNewsDto.status)
            news.status = updateNewsDto.status;
        if (updateNewsDto.scheduledDate)
            news.scheduledDate = new Date(updateNewsDto.scheduledDate);
        const updatedNews = await this.newsRepository.save(news);
        return updatedNews;
    }
    async delete(id, userId) {
        const news = await this.newsRepository.findOne({
            where: { id },
            relations: ['author'],
        });
        if (!news) {
            throw new common_1.NotFoundException('News not found');
        }
        if (news.authorId !== userId) {
            throw new common_1.ForbiddenException('You can only delete your own news');
        }
        const job = this.scheduledJobs.get(id);
        if (job) {
            job.cancel();
            this.scheduledJobs.delete(id);
        }
        await this.newsRepository.delete(id);
    }
    async toggleLike(newsId, userId) {
        const news = await this.newsRepository.findOne({ where: { id: newsId } });
        if (!news) {
            throw new common_1.NotFoundException('News not found');
        }
        const existingLike = await this.newsLikeRepository.findOne({
            where: { newsId, userId },
        });
        if (existingLike) {
            await this.newsLikeRepository.delete(existingLike.id);
            return false;
        }
        else {
            const like = this.newsLikeRepository.create({
                news,
                newsId,
                userId,
            });
            await this.newsLikeRepository.save(like);
            return true;
        }
    }
    async getLikesCount(newsId) {
        return this.newsLikeRepository.count({ where: { newsId } });
    }
    async hasUserLiked(newsId, userId) {
        const like = await this.newsLikeRepository.findOne({
            where: { newsId, userId },
        });
        return !!like;
    }
    async addComment(newsId, userId, content) {
        const news = await this.newsRepository.findOne({ where: { id: newsId } });
        if (!news) {
            throw new common_1.NotFoundException('News not found');
        }
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const comment = this.newsCommentRepository.create({
            news,
            newsId,
            author: user,
            authorId: userId,
            content,
        });
        return this.newsCommentRepository.save(comment);
    }
    async deleteComment(commentId, userId) {
        const comment = await this.newsCommentRepository.findOne({
            where: { id: commentId },
        });
        if (!comment) {
            throw new common_1.NotFoundException('Comment not found');
        }
        if (comment.authorId !== userId) {
            throw new common_1.ForbiddenException('You can only delete your own comment');
        }
        await this.newsCommentRepository.delete(commentId);
    }
    async getComments(newsId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [data, total] = await this.newsCommentRepository.findAndCount({
            where: { newsId },
            skip,
            take: limit,
            relations: ['author'],
            order: { createdAt: 'DESC' },
        });
        return { data, total };
    }
    async getByCategory(category, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const query = this.newsRepository
            .createQueryBuilder('news')
            .where("news.status = 'published'")
            .leftJoinAndSelect('news.author', 'author')
            .leftJoinAndSelect('news.categories', 'categories')
            .leftJoinAndSelect('news.likes', 'likes')
            .leftJoinAndSelect('news.comments', 'comments');
        const total = await query.getCount();
        const data = await query
            .skip(skip)
            .take(limit)
            .orderBy('news.publishedDate', 'DESC')
            .getMany();
        return { data, total };
    }
    async getUserNews(userId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [data, total] = await this.newsRepository.findAndCount({
            where: { authorId: userId },
            skip,
            take: limit,
            order: { createdAt: 'DESC' },
            relations: ['author', 'categories', 'likes', 'comments'],
        });
        return { data, total };
    }
};
exports.NewsService = NewsService;
exports.NewsService = NewsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(news_entity_1.News)),
    __param(1, (0, typeorm_1.InjectRepository)(news_like_entity_1.NewsLike)),
    __param(2, (0, typeorm_1.InjectRepository)(news_comment_entity_1.NewsComment)),
    __param(3, (0, typeorm_1.InjectRepository)(news_category_entity_1.NewsCategory)),
    __param(4, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], NewsService);
//# sourceMappingURL=news.service.js.map