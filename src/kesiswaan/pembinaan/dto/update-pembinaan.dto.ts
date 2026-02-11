import { IsInt, IsString, IsOptional, Length } from 'class-validator';

export class UpdatePembinaanDto {
  @IsString()
  @IsOptional()
  @Length(1, 2000)
  hasil_pembinaan?: string;

  @IsString()
  @IsOptional()
  @Length(1, 2000)
  catatan_bk?: string;

  @IsString()
  @IsOptional()
  status?: string; // pending, in_progress, completed, archived

  @IsString()
  @IsOptional()
  follow_up_type?: string; // follow_up, closed, escalated

  @IsOptional()
  follow_up_date?: string; // YYYY-MM-DD

  @IsInt()
  @IsOptional()
  point_pelanggaran_id?: number; // Manual assignment jika perlu override
}
