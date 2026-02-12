import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationService } from './notification.service';
import { Notification } from './entities/notification.entity';
export declare class NotificationGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private notificationService;
    server: Server;
    private readonly logger;
    private userSockets;
    constructor(notificationService: NotificationService);
    afterInit(server: Server): void;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleMarkAsRead(client: Socket, data: {
        notification_id: number;
    }): Promise<{
        success: boolean;
    }>;
    handleGetUnreadCount(client: Socket): Promise<{
        unread_count: number;
    }>;
    sendNotificationToUser(userId: number, notification: Notification): void;
    sendNotificationToUsers(userIds: number[], notification: any): void;
}
