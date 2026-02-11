import { IsInt, IsString, IsBoolean, IsOptional, Min, Max, Length } from 'class-validator';

export class CreatePointPelanggaranDto {
  @IsInt()
  tahun_point: number;

  @IsString()
  @Length(3, 100)
  category_point: string;

  @IsString()
  @Length(3, 255)
  nama_pelanggaran: string;

  @IsInt()
  kode: number;

  @IsInt()
  @Min(1)
  @Max(100)
  bobot: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isSanksi?: boolean;

  @IsBoolean()
  @IsOptional()
  isDo?: boolean;

  @IsString()
  @IsOptional()
  deskripsi?: string;
}
