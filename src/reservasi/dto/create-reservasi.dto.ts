import { IsString, IsNumber, IsDate, IsOptional, IsEnum } from 'class-validator';

export class CreateReservasiDto {
  @IsNumber()
  studentId: number;

  @IsNumber()
  counselorId: number;

  @IsDate()
  preferredDate: Date;

  @IsString()
  preferredTime: string;

  @IsEnum(['chat', 'tatap-muka'])
  type: 'chat' | 'tatap-muka';

  @IsOptional()
  @IsEnum(['umum', 'kelompok', 'khusus'])
  counselingType?: 'umum' | 'kelompok' | 'khusus'; // Default: 'umum'

  @IsOptional()
  @IsNumber()
  topicId?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  room?: string;
}

/**
 * DTO untuk create Reservasi dengan tipe Pembinaan (Konseling Khusus)
 * Digunakan saat pembina siswa mengirim data pembinaan ke BK
 */
export class CreatePembinaanReservasiDto {
  @IsNumber()
  pembinaan_id: number; // Reference ke Pembinaan record

  @IsNumber()
  counselorId: number; // BK Counselor yang ditugaskan

  @IsEnum(['ringan', 'berat'])
  pembinaanType: 'ringan' | 'berat'; // Tipe pembinaan (ringan=BK handle, berat=WAKA handle)

  @IsDate()
  preferredDate: Date; // Jadwal pertemuan pembinaan

  @IsString()
  preferredTime: string; // Format: HH:MM

  @IsEnum(['chat', 'tatap-muka'])
  type: 'chat' | 'tatap-muka'; // Tipe sesi

  @IsOptional()
  @IsString()
  notes?: string; // Catatan pembina untuk BK

  @IsOptional()
  @IsString()
  room?: string; // Ruang tatap muka jika ada
}

export class UpdateReservasiStatusDto {
  @IsEnum(['approved', 'rejected', 'in_counseling', 'completed', 'cancelled'])
  status: 'approved' | 'rejected' | 'in_counseling' | 'completed' | 'cancelled';

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
