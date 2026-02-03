import { PartialType } from '@nestjs/mapped-types';
import { CreateLaporanBkDto } from './create-laporan-bk.dto';

export class UpdateLaporanBkDto extends PartialType(CreateLaporanBkDto) {}
