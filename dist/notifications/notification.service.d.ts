import { Repository } from 'typeorm';
import type { NotificationType } from './entities/notification.entity';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationGateway } from './notification.gateway';
export declare class NotificationService {
    private notificationRepository;
    private notificationGateway;
    private readonly logger;
    constructor(notificationRepository: Repository<Notification>, notificationGateway: NotificationGateway);
    create(createNotificationDto: CreateNotificationDto): Promise<Notification>;
    createMultiple(notifications: CreateNotificationDto[]): Promise<Notification[]>;
    markAsRead(notificationId: number, userId: number): Promise<Notification>;
    bulkMarkAsRead(userId: number): Promise<{
        affectedRows: number;
    }>;
    getUnreadCount(userId: number): Promise<number>;
    findUserNotifications(userId: number, limit?: number, offset?: number): Promise<{
        data: Notification[];
        total: number;
    }>;
    findUnreadNotifications(userId: number, limit?: number): Promise<{
        data: Notification[];
        total: number;
    }>;
    findByType(userId: number, type: NotificationType, limit?: number, offset?: number): Promise<{
        data: Notification[];
        total: number;
    }>;
    archive(notificationId: number, userId: number): Promise<Notification>;
    delete(notificationId: number, userId: number): Promise<{
        success: boolean;
    }>;
    findByRelatedId(relatedId: number, relatedType: string): Promise<Notification[]>;
    clearArchivedNotifications(daysOld?: number): Promise<{
        deletedCount: number;
    }>;
}
