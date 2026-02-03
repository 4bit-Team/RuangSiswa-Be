import { PartialType } from '@nestjs/mapped-types';
import { CreateBkScheduleDto } from './create-bk-schedule.dto';

export class UpdateBkScheduleDto extends PartialType(CreateBkScheduleDto) {}
