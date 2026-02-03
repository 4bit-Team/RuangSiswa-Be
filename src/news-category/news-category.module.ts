import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsCategory } from './entities/news-category.entity';
import { NewsCategoryService } from './news-category.service';
import { NewsCategoryController } from './news-category.controller';

@Module({
  imports: [TypeOrmModule.forFeature([NewsCategory])],
  providers: [NewsCategoryService],
  controllers: [NewsCategoryController],
  exports: [NewsCategoryService],
})
export class NewsCategoryModule {}
