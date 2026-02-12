import { Reservasi } from '../../../reservasi/entities/reservasi.entity';
import { Pembinaan } from '../../pembinaan/entities/pembinaan.entity';
import { User } from '../../../users/entities/user.entity';
export type PembinaanRinganStatus = 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';
export declare class PembinaanRingan {
    id: number;
    reservasi: Reservasi;
    reservasi_id: number;
    pembinaan: Pembinaan;
    pembinaan_id: number;
    student_id: number;
    student_name: string;
    counselor: User;
    counselor_id: number;
    hasil_pembinaan: string;
    catatan_bk: string;
    scheduled_date: Date;
    scheduled_time: string;
    status: PembinaanRinganStatus;
    bk_feedback: string | null;
    bk_notes: string | null;
    bk_decision_date: Date | null;
    has_follow_up: boolean;
    follow_up_notes: string | null;
    createdAt: Date;
    updatedAt: Date;
    approvedAt: Date | null;
    completedAt: Date | null;
}
