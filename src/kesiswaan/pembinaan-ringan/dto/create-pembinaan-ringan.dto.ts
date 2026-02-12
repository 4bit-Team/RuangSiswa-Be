export class CreatePembinaanRinganDto {
  reservasi_id: number;
  pembinaan_id: number;
  student_id: number;
  student_name: string;
  counselor_id: number;
  hasil_pembinaan: string;
  catatan_bk: string;
  scheduled_date: string; // Format: YYYY-MM-DD
  scheduled_time: string; // Format: HH:MM
}

export class ApprovePembinaanRinganDto {
  status: 'approved' | 'rejected';
  bk_feedback?: string;
  bk_notes?: string;
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
}
