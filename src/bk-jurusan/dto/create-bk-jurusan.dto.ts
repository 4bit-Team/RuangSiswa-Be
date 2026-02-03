import { IsNumber, IsArray, IsOptional } from 'class-validator';

export class CreateBkJurusanDto {
  @IsNumber()
  bkId: number;

  @IsNumber()
  jurusanId: number;
}

export class UpdateBkJurusanDto {
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  jurusanIds?: number[];
}
