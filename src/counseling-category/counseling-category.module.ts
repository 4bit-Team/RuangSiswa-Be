import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CounselingCategory } from './entities/counseling-category.entity';
import { CounselingCategoryService } from './counseling-category.service';
import { CounselingCategoryController } from './counseling-category.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CounselingCategory])],
  providers: [CounselingCategoryService],
  controllers: [CounselingCategoryController],
  exports: [CounselingCategoryService],
})
export class CounselingCategoryModule {}
