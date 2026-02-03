import { PartialType } from '@nestjs/mapped-types';
import { CreateCounselingCategoryDto } from './create-counseling-category.dto';

export class UpdateCounselingCategoryDto extends PartialType(CreateCounselingCategoryDto) {}
