import { PartialType } from '@nestjs/mapped-types';
import { CreateReservasiDto } from './create-reservasi.dto';

export class UpdateReservasiDto extends PartialType(CreateReservasiDto) {}
