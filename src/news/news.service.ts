import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In, MoreThanOrEqual } from 'typeorm';
import { News, NewsStatus } from './entities/news.entity';
import { NewsLike } from './entities/news-like.entity';
import { NewsComment } from './entities/news-comment.entity';
import { NewsCategory } from '../news-category/entities/news-category.entity';
import { CreateNewsDto, NewsQueryDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { User } from '../users/entities/user.entity';
import * as schedule from 'node-schedule';

@Injectable()
export class NewsService {
  private scheduledJobs: Map<number, schedule.Job> = new Map();

  constructor(
    @InjectRepository(News)
    private newsRepository: Repository<News>,
    @InjectRepository(NewsLike)
    private newsLikeRepository: Repository<NewsLike>,
    @InjectRepository(NewsComment)
    private newsCommentRepository: Repository<NewsComment>,
    @InjectRepository(NewsCategory)
    private newsCategoryRepository: Repository<NewsCategory>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    this.initializeScheduledNews();
  }

  // Initialize scheduled news on service startup
  private async initializeScheduledNews() {
    const scheduledNews = await this.newsRepository.find({
      where: { status: 'scheduled' },
    });

    scheduledNews.forEach((news) => {
      this.scheduleNewsPublishing(news.id, news.scheduledDate);
    });
  }

  // Schedule news to be published at a specific time
  private scheduleNewsPublishing(newsId: number, scheduledDate: Date) {
    const job = schedule.scheduleJob(scheduledDate, async () => {
      await this.publishScheduledNews(newsId);
      this.scheduledJobs.delete(newsId);
    });

    this.scheduledJobs.set(newsId, job);
  }

  // Publish scheduled news
  private async publishScheduledNews(newsId: number) {
    const news = await this.newsRepository.findOne({ where: { id: newsId } });
    if (news) {
      news.status = 'published';
      news.publishedDate = new Date();
      await this.newsRepository.save(news);
    }
  }

  // Create news
  async create(createNewsDto: CreateNewsDto, userId: number): Promise<News> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== 'bk' && user.role !== 'admin') {
      throw new ForbiddenException('Only BK staff and admin can create news');
    }

    // Validate scheduledDate if status is scheduled
    if (createNewsDto.status === 'scheduled') {
      if (!createNewsDto.scheduledDate) {
        throw new BadRequestException('Scheduled date is required for scheduled news');
      }
      const scheduledDate = new Date(createNewsDto.scheduledDate);
      if (isNaN(scheduledDate.getTime())) {
        throw new BadRequestException('Invalid scheduled date format');
      }
    }

    // Load categories
    let categories: NewsCategory[] = [];
    if (createNewsDto.categoryIds && createNewsDto.categoryIds.length > 0) {
      categories = await this.newsCategoryRepository.find({
        where: { id: In(createNewsDto.categoryIds) },
      });

      if (categories.length !== createNewsDto.categoryIds.length) {
        throw new BadRequestException('One or more categories not found');
      }
    } else {
      throw new BadRequestException('At least one category is required');
    }

    const news = this.newsRepository.create({
      title: createNewsDto.title,
      summary: createNewsDto.summary,
      content: createNewsDto.content,
      imageUrl: createNewsDto.imageUrl,
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

    // Schedule if needed
    if (createNewsDto.status === 'scheduled' && news.scheduledDate) {
      this.scheduleNewsPublishing(savedNews.id, news.scheduledDate);
    }

    return savedNews;
  }

  // Get all news with filters
  async findAll(query: NewsQueryDto = {}): Promise<{ data: News[]; total: number }> {
    const page = parseInt(query.page ?? '1') || 1;
    const limit = parseInt(query.limit ?? '10') || 10;
    const skip = (page - 1) * limit;

    let whereCondition: any = {};

    if (query.status) {
      whereCondition.status = query.status;
    }

    if (query.search) {
      whereCondition = [
        { ...whereCondition, title: Like(`%${query.search}%`) },
        { ...whereCondition, summary: Like(`%${query.search}%`) },
        { ...whereCondition, content: Like(`%${query.search}%`) },
      ];
    }

    let orderBy: any = { createdAt: 'DESC' };
    if (query.sortBy === 'oldest') {
      orderBy = { createdAt: 'ASC' };
    } else if (query.sortBy === 'mostViewed') {
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

  // Get published news only
  async findPublished(query: NewsQueryDto = {}): Promise<{ data: News[]; total: number }> {
    const publishedQuery: NewsQueryDto = { ...query, status: 'published' };
    return this.findAll(publishedQuery);
  }

  // Get single news by ID
  async findOne(id: number): Promise<News> {
    const news = await this.newsRepository.findOne({
      where: { id },
      relations: ['author', 'categories', 'likes', 'comments', 'comments.author'],
    });

    if (!news) {
      throw new NotFoundException('News not found');
    }

    // Increment view count
    news.viewCount += 1;
    await this.newsRepository.save(news);

    return news;
  }

  // Update news
  async update(
    id: number,
    updateNewsDto: UpdateNewsDto,
    userId: number,
  ): Promise<News> {
    const news = await this.newsRepository.findOne({
      where: { id },
      relations: ['author', 'categories'],
    });

    if (!news) {
      throw new NotFoundException('News not found');
    }

    if (news.authorId !== userId) {
      throw new ForbiddenException('You can only edit your own news');
    }

    // Handle categories update
    if (updateNewsDto.categoryIds && updateNewsDto.categoryIds.length > 0) {
      const categories = await this.newsCategoryRepository.find({
        where: { id: In(updateNewsDto.categoryIds) },
      });

      if (categories.length !== updateNewsDto.categoryIds.length) {
        throw new BadRequestException('One or more categories not found');
      }

      news.categories = categories;
    } else if (updateNewsDto.categoryIds?.length === 0) {
      // Allow clearing categories
      news.categories = [];
    }

    // Handle status change to scheduled
    if (
      updateNewsDto.status === 'scheduled' &&
      updateNewsDto.scheduledDate
    ) {
      const scheduledDate = new Date(updateNewsDto.scheduledDate);
      if (isNaN(scheduledDate.getTime())) {
        throw new BadRequestException('Invalid scheduled date format');
      }
      this.scheduleNewsPublishing(id, scheduledDate);
    }

    // Update published date if status changed to published
    if (updateNewsDto.status === 'published' && news.status !== 'published') {
      news.publishedDate = new Date();
    }

    // Update fields
    if (updateNewsDto.title) news.title = updateNewsDto.title;
    if (updateNewsDto.summary) news.summary = updateNewsDto.summary;
    if (updateNewsDto.content) news.content = updateNewsDto.content;
    if (updateNewsDto.imageUrl) news.imageUrl = updateNewsDto.imageUrl;
    if (updateNewsDto.status) news.status = updateNewsDto.status;
    if (updateNewsDto.scheduledDate) news.scheduledDate = new Date(updateNewsDto.scheduledDate);

    const updatedNews = await this.newsRepository.save(news);
    return updatedNews;
  }

  // Delete news
  async delete(id: number, userId: number): Promise<void> {
    const news = await this.newsRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!news) {
      throw new NotFoundException('News not found');
    }

    if (news.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own news');
    }

    // Cancel scheduled job if exists
    const job = this.scheduledJobs.get(id);
    if (job) {
      job.cancel();
      this.scheduledJobs.delete(id);
    }

    await this.newsRepository.delete(id);
  }

  // Toggle like
  async toggleLike(newsId: number, userId: number): Promise<boolean> {
    const news = await this.newsRepository.findOne({ where: { id: newsId } });
    if (!news) {
      throw new NotFoundException('News not found');
    }

    const existingLike = await this.newsLikeRepository.findOne({
      where: { newsId, userId },
    });

    if (existingLike) {
      await this.newsLikeRepository.delete(existingLike.id);
      return false; // Removed like
    } else {
      const like = this.newsLikeRepository.create({
        news,
        newsId,
        userId,
      });
      await this.newsLikeRepository.save(like);
      return true; // Added like
    }
  }

  // Get likes count
  async getLikesCount(newsId: number): Promise<number> {
    return this.newsLikeRepository.count({ where: { newsId } });
  }

  // Check if user liked news
  async hasUserLiked(newsId: number, userId: number): Promise<boolean> {
    const like = await this.newsLikeRepository.findOne({
      where: { newsId, userId },
    });
    return !!like;
  }

  // Add comment
  async addComment(
    newsId: number,
    userId: number,
    content: string,
  ): Promise<NewsComment> {
    const news = await this.newsRepository.findOne({ where: { id: newsId } });
    if (!news) {
      throw new NotFoundException('News not found');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
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

  // Delete comment
  async deleteComment(commentId: number, userId: number): Promise<void> {
    const comment = await this.newsCommentRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own comment');
    }

    await this.newsCommentRepository.delete(commentId);
  }

  // Get comments for news
  async getComments(
    newsId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: NewsComment[]; total: number }> {
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

  // Get news by category
  async getByCategory(
    category: NewsCategory,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: News[]; total: number }> {
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

  // Get user's news
  async getUserNews(
    userId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: News[]; total: number }> {
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

  // Increment view count only
  async incrementViews(id: number): Promise<News> {
    const news = await this.newsRepository.findOne({ where: { id } });
    if (!news) {
      throw new NotFoundException('News not found');
    }
    news.viewCount += 1;
    await this.newsRepository.save(news);
    return news;
  }
}
