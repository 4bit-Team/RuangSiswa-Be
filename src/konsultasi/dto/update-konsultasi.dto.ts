import { PartialType } from '@nestjs/mapped-types';
import { CreateKonsultasiDto } from './create-konsultasi.dto';

export class UpdateKonsultasiDto extends PartialType(CreateKonsultasiDto) {}
