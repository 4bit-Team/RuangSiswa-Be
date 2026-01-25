import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsultationCategory } from './entities/consultation-category.entity';
import { ConsultationCategoryService } from './consultation-category.service';
import { ConsultationCategoryController } from './consultation-category.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ConsultationCategory])],
  providers: [ConsultationCategoryService],
  controllers: [ConsultationCategoryController],
  exports: [ConsultationCategoryService],
})
export class ConsultationCategoryModule {}
