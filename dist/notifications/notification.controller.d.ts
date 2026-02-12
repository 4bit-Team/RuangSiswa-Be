import { NotificationService } from './notification.service';
import type { NotificationType } from './entities/notification.entity';
import { Notification } from './entities/notification.entity';
export declare class NotificationController {
    private notificationService;
    constructor(notificationService: NotificationService);
    getNotifications(req: any, limit?: number, offset?: number): Promise<{
        data: Notification[];
        total: number;
    }>;
    getUnreadCount(req: any): Promise<{
        unread_count: number;
    }>;
    getUnreadNotifications(req: any, limit?: number): Promise<{
        data: Notification[];
        total: number;
    }>;
    getNotificationsByType(req: any, type: NotificationType, limit?: number, offset?: number): Promise<{
        data: Notification[];
        total: number;
    }>;
    markAsRead(req: any, notificationId: number): Promise<Notification>;
    markAllAsRead(req: any): Promise<{
        affectedRows: number;
    }>;
    archiveNotification(req: any, notificationId: number): Promise<Notification>;
}
