import { PartialType } from '@nestjs/mapped-types';
import { CreateToxicFilterDto } from './create-toxic-filter.dto';

export class UpdateToxicFilterDto extends PartialType(CreateToxicFilterDto) {}
