export declare class CreatePembinaanRinganDto {
    reservasi_id: number;
    pembinaan_id: number;
    student_id: number;
    student_name: string;
    counselor_id: number;
    hasil_pembinaan: string;
    catatan_bk: string;
    scheduled_date: string;
    scheduled_time: string;
}
export declare class ApprovePembinaanRinganDto {
    status: 'approved' | 'rejected';
    bk_feedback?: string;
    bk_notes?: string;
}
export declare class CompletePembinaanRinganDto {
    status: 'completed';
    bk_feedback: string;
    bk_notes?: string;
    has_follow_up?: boolean;
    follow_up_notes?: string;
}
export declare class UpdatePembinaanRinganDto {
    hasil_pembinaan?: string;
    catatan_bk?: string;
    scheduled_date?: string;
    scheduled_time?: string;
    bk_feedback?: string;
    bk_notes?: string;
}
