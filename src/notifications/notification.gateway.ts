import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Inject, forwardRef } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Notification } from './entities/notification.entity';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class NotificationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationGateway.name);
  private userSockets: Map<number, string[]> = new Map(); // userId -> [socketIds]

  constructor(
    @Inject(forwardRef(() => NotificationService))
    private notificationService: NotificationService
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;

    if (userId) {
      const userIdNum = parseInt(userId);

      if (!this.userSockets.has(userIdNum)) {
        this.userSockets.set(userIdNum, []);
      }

      const userSocketList = this.userSockets.get(userIdNum);
      if (userSocketList) {
        userSocketList.push(client.id);
        client.join(`user_${userIdNum}`);

        this.logger.log(
          `User ${userIdNum} connected with socket ${client.id}. Total sockets: ${userSocketList.length}`,
        );
      }
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;

    if (userId) {
      const userIdNum = parseInt(userId);
      const sockets = this.userSockets.get(userIdNum);

      if (sockets) {
        const filteredSockets = sockets.filter((id) => id !== client.id);
        if (filteredSockets.length > 0) {
          this.userSockets.set(userIdNum, filteredSockets);
        } else {
          this.userSockets.delete(userIdNum);
        }
      }

      this.logger.log(`User ${userIdNum} disconnected. Socket: ${client.id}`);
    }
  }

  @SubscribeMessage('mark_as_read')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { notification_id: number },
  ) {
    const userId = client.handshake.query.userId as string;

    if (userId) {
      const userIdNum = parseInt(userId);
      await this.notificationService.markAsRead(data.notification_id, userIdNum);

      // Broadcast to user's other sockets
      this.server.to(`user_${userIdNum}`).emit('notification_read', {
        notification_id: data.notification_id,
      });

      return { success: true };
    }

    return { success: false };
  }

  @SubscribeMessage('get_unread_count')
  async handleGetUnreadCount(@ConnectedSocket() client: Socket) {
    const userId = client.handshake.query.userId as string;

    if (userId) {
      const userIdNum = parseInt(userId);
      const count = await this.notificationService.getUnreadCount(userIdNum);
      return { unread_count: count };
    }

    return { unread_count: 0 };
  }

  // Send notification to user (called by NotificationService)
  sendNotificationToUser(userId: number, notification: Notification) {
    const userIdStr = `user_${userId}`;

    this.server.to(userIdStr).emit('new_notification', {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      related_id: notification.related_id,
      related_type: notification.related_type,
      created_at: notification.created_at,
      metadata: notification.metadata,
    });

    this.logger.log(`Notification sent to user ${userId}`);
  }

  // Broadcast to multiple users
  sendNotificationToUsers(userIds: number[], notification: any) {
    userIds.forEach((userId) => {
      this.sendNotificationToUser(userId, notification);
    });
  }
}
