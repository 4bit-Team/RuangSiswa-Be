import { IsInt, IsString, IsOptional, IsDate, Length, IsDateString } from 'class-validator';

export class SyncPembinaanDto {
  @IsInt()
  walas_id: number;

  @IsString()
  @Length(3, 255)
  walas_name: string;

  @IsInt()
  siswas_id: number;

  @IsString()
  @Length(3, 255)
  siswas_name: string;

  @IsString()
  @Length(3, 255)
  kasus: string;

  @IsString()
  @Length(3, 255)
  tindak_lanjut: string;

  @IsString()
  @Length(1, 2000)
  keterangan: string;

  @IsDateString()
  tanggal_pembinaan: string; // YYYY-MM-DD

  @IsInt()
  @IsOptional()
  point_pelanggaran_id?: number; // Jika sudah tahu point ID, boleh diberikan

  @IsInt()
  @IsOptional()
  class_id?: number;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  class_name?: string;
}
