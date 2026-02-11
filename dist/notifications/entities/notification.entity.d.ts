import { User } from '../../users/entities/user.entity';
export type NotificationType = 'reservasi_approved' | 'reservasi_rejected' | 'session_recorded' | 'escalation_to_waka' | 'decision_made' | 'parent_notification' | 'general' | 'pelanggaran_baru' | 'sp_dibuat' | 'reservasi_pembinaan_dibuat' | 'pembinaan_disetujui';
export type NotificationStatus = 'unread' | 'read' | 'archived';
export declare class Notification {
    id: number;
    recipient: User;
    recipient_id: number;
    type: NotificationType;
    title: string;
    message: string;
    related_id: number;
    related_type: string;
    status: NotificationStatus;
    read_at: Date;
    created_at: Date;
    updated_at: Date;
    metadata: Record<string, any>;
}
