import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';
import { News } from './entities/news.entity';
import { NewsLike } from './entities/news-like.entity';
import { NewsComment } from './entities/news-comment.entity';
import { NewsCategory } from '../news-category/entities/news-category.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([News, NewsLike, NewsComment, NewsCategory, User])],
  controllers: [NewsController],
  providers: [NewsService],
  exports: [NewsService],
})
export class NewsModule {}
