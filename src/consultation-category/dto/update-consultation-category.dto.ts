import { PartialType } from '@nestjs/mapped-types';
import { CreateConsultationCategoryDto } from './create-consultation-category.dto';

export class UpdateConsultationCategoryDto extends PartialType(CreateConsultationCategoryDto) {}
