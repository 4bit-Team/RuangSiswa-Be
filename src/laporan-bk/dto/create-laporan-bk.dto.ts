import { IsString, IsDate, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export type StatusPerkembanganPesertaDidik = 'Membaik' | 'Stabil' | 'Menurun' | 'Belum Terlihat Perubahan';

export class CreateLaporanBkDto {
  @IsString()
  namaKonseling: string;

  @IsOptional()
  @IsNumber()
  jurusanId?: number;

  @IsOptional()
  @IsNumber()
  kelasId?: number;

  @IsDate()
  @Type(() => Date)
  tanggalDiprosesAiBk: Date;

  @IsString()
  deskripsiKasusMasalah: string;

  @IsOptional()
  @IsString()
  bentukPenanganganSebelumnya?: string;

  @IsOptional()
  @IsString()
  riwayatSpDanKasus?: string;

  @IsOptional()
  @IsString()
  layananBk?: string;

  @IsOptional()
  @IsString()
  followUpTindakanBk?: string;

  @IsOptional()
  @IsString()
  penahanganGuruBkKonselingProsesPembinaan?: string;

  @IsOptional()
  @IsString()
  pertemuanKe1?: string;

  @IsOptional()
  @IsString()
  pertemuanKe2?: string;

  @IsOptional()
  @IsString()
  pertemuanKe3?: string;

  @IsOptional()
  @IsString()
  hasilPemantauanKeterangan?: string;

  @IsOptional()
  @IsNumber()
  guruBkYangMenanganiId?: number;

  @IsOptional()
  @IsEnum(['Membaik', 'Stabil', 'Menurun', 'Belum Terlihat Perubahan'])
  statusPerkembanganPesertaDidik?: StatusPerkembanganPesertaDidik;

  @IsOptional()
  @IsString()
  keteranganKetersedianDokumen?: string;
}
