import type { NotificationType } from '../entities/notification.entity';
export declare class CreateNotificationDto {
    recipient_id: number;
    type: NotificationType;
    title: string;
    message: string;
    related_id?: number;
    related_type?: string;
    metadata?: Record<string, any>;
}
export declare class MarkAsReadDto {
    notification_id: number;
}
export declare class BulkMarkAsReadDto {
    is_all?: boolean;
}
