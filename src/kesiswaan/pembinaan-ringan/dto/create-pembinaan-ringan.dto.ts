export class CreatePembinaanRinganDto {
  reservasi_id?: number; // Optional - can be created later
  pembinaan_id: number;
  student_id: number;
  student_name: string;
  counselor_id: number;
  hasil_pembinaan: string;
  
  catatan_bk: string;
  scheduled_date: string; // Format: YYYY-MM-DD
  scheduled_time: string; // Format: HH:MM
  sp_level?: 'SP1' | 'SP2' | null; // SP level (optional)
}

export class ApprovePembinaanRinganDto {
  status: 'approved' | 'rejected';
  bk_feedback?: string;
  bk_notes?: string;
  sp_level?: 'SP1' | 'SP2' | null; // Optional: set SP level when approving
}

export class CompletePembinaanRinganDto {
  status: 'completed';
  bk_feedback: string;
  bk_notes?: string;
  has_follow_up?: boolean;
  follow_up_notes?: string;
}

export class UpdatePembinaanRinganDto {
  hasil_pembinaan?: string;
  catatan_bk?: string;
  scheduled_date?: string;
  scheduled_time?: string;
  bk_feedback?: string;
  bk_notes?: string;
  sp_level?: 'SP1' | 'SP2' | null; // SP level (optional)
}
