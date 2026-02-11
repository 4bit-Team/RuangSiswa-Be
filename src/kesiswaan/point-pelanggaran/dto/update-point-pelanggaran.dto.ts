import { PartialType } from '@nestjs/mapped-types';
import { CreatePointPelanggaranDto } from './create-point-pelanggaran.dto';

export class UpdatePointPelanggaranDto extends PartialType(CreatePointPelanggaranDto) {}
