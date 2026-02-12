import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { NotificationType, NotificationStatus } from './entities/notification.entity';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto, MarkAsReadDto, BulkMarkAsReadDto } from './dto/create-notification.dto';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @Inject(forwardRef(() => NotificationGateway))
    private notificationGateway: NotificationGateway,
  ) {}

  /**
   * Create and broadcast a notification
   */
  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    try {
      // Validate recipient_id
      if (!createNotificationDto.recipient_id) {
        throw new Error('recipient_id is required');
      }

      const notification = this.notificationRepository.create(createNotificationDto);
      const savedNotification = await this.notificationRepository.save(notification);

      // Broadcast via WebSocket (non-blocking)
      try {
        this.notificationGateway.sendNotificationToUser(
          createNotificationDto.recipient_id,
          savedNotification,
        );
      } catch (wsError) {
        this.logger.warn(
          `Failed to broadcast notification via WebSocket: ${wsError.message}`,
        );
        // Continue anyway - notification is saved in DB
      }

      this.logger.log(
        `Notification created for user ${createNotificationDto.recipient_id}: ${createNotificationDto.title}`,
      );

      return savedNotification;
    } catch (error) {
      this.logger.error(`Failed to create notification: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create multiple notifications for different users
   */
  async createMultiple(notifications: CreateNotificationDto[]): Promise<Notification[]> {
    try {
      if (!notifications || notifications.length === 0) {
        return [];
      }

      const savedNotifications = await this.notificationRepository.save(
        notifications.map((dto) => this.notificationRepository.create(dto)),
      );

      // Broadcast each notification (non-blocking)
      let broadcastCount = 0;
      let broadcastErrors = 0;
      
      savedNotifications.forEach((notification) => {
        try {
          this.notificationGateway.sendNotificationToUser(
            notification.recipient_id,
            notification,
          );
          broadcastCount++;
        } catch (wsError) {
          broadcastErrors++;
          this.logger.warn(
            `Failed to broadcast notification to user ${notification.recipient_id}: ${wsError.message}`,
          );
        }
      });

      this.logger.log(
        `${savedNotifications.length} notifications created (${broadcastCount} broadcasted, ${broadcastErrors} broadcast errors)`,
      );

      return savedNotifications;
    } catch (error) {
      this.logger.error(`Failed to create multiple notifications: ${error.message}`);
      throw error;
    }
  }

  /**
   * Mark a single notification as read
   */
  async markAsRead(notificationId: number, userId: number): Promise<Notification> {
    try {
      const notification = await this.notificationRepository.findOne({
        where: { id: notificationId, recipient_id: userId },
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      notification.status = 'read';
      notification.read_at = new Date();

      const updated = await this.notificationRepository.save(notification);

      this.logger.log(`Notification ${notificationId} marked as read for user ${userId}`);

      return updated;
    } catch (error) {
      this.logger.error(`Failed to mark notification as read: ${error.message}`);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async bulkMarkAsRead(userId: number): Promise<{ affectedRows: number }> {
    try {
      const result = await this.notificationRepository.update(
        {
          recipient_id: userId,
          status: 'unread',
        },
        {
          status: 'read',
          read_at: new Date(),
        },
      );

      const affectedRows = result.affected || 0;

      this.logger.log(`Marked ${affectedRows} notifications as read for user ${userId}`);

      return { affectedRows };
    } catch (error) {
      this.logger.error(`Failed to bulk mark notifications as read: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId: number): Promise<number> {
    try {
      const count = await this.notificationRepository.countBy({
        recipient_id: userId,
        status: 'unread',
      });

      return count;
    } catch (error) {
      this.logger.error(`Failed to get unread count: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get user's notifications with pagination
   */
  async findUserNotifications(
    userId: number,
    limit: number = 20,
    offset: number = 0,
  ): Promise<{ data: Notification[]; total: number }> {
    try {
      const [data, total] = await this.notificationRepository.findAndCount({
        where: { recipient_id: userId },
        order: { created_at: 'DESC' },
        take: limit,
        skip: offset,
      });

      return { data, total };
    } catch (error) {
      this.logger.error(`Failed to find user notifications: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get unread notifications for a user
   */
  async findUnreadNotifications(
    userId: number,
    limit: number = 20,
  ): Promise<{ data: Notification[]; total: number }> {
    try {
      const [data, total] = await this.notificationRepository.findAndCount({
        where: {
          recipient_id: userId,
          status: 'unread',
        },
        order: { created_at: 'DESC' },
        take: limit,
      });

      return { data, total };
    } catch (error) {
      this.logger.error(`Failed to find unread notifications: ${error.message}`);
      throw error;
    }
  }

  /**
   * Filter notifications by type
   */
  async findByType(
    userId: number,
    type: NotificationType,
    limit: number = 20,
    offset: number = 0,
  ): Promise<{ data: Notification[]; total: number }> {
    try {
      const [data, total] = await this.notificationRepository.findAndCount({
        where: { recipient_id: userId, type },
        order: { created_at: 'DESC' },
        take: limit,
        skip: offset,
      });

      return { data, total };
    } catch (error) {
      this.logger.error(`Failed to find notifications by type: ${error.message}`);
      throw error;
    }
  }

  /**
   * Archive (mark as archived) a notification
   */
  async archive(notificationId: number, userId: number): Promise<Notification> {
    try {
      const notification = await this.notificationRepository.findOne({
        where: { id: notificationId, recipient_id: userId },
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      notification.status = 'archived';

      const updated = await this.notificationRepository.save(notification);

      this.logger.log(`Notification ${notificationId} archived for user ${userId}`);

      return updated;
    } catch (error) {
      this.logger.error(`Failed to archive notification: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete a notification
   */
  async delete(notificationId: number, userId: number): Promise<{ success: boolean }> {
    try {
      const result = await this.notificationRepository.delete({
        id: notificationId,
        recipient_id: userId,
      });

      const success = (result.affected || 0) > 0;

      if (success) {
        this.logger.log(`Notification ${notificationId} deleted for user ${userId}`);
      }

      return { success };
    } catch (error) {
      this.logger.error(`Failed to delete notification: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get notifications by related ID (e.g., all notifications for a specific reservasi)
   */
  async findByRelatedId(
    relatedId: number,
    relatedType: string,
  ): Promise<Notification[]> {
    try {
      const notifications = await this.notificationRepository.find({
        where: { related_id: relatedId, related_type: relatedType },
        order: { created_at: 'DESC' },
      });

      return notifications;
    } catch (error) {
      this.logger.error(`Failed to find notifications by related ID: ${error.message}`);
      throw error;
    }
  }

  /**
   * Clear old archived notifications
   */
  async clearArchivedNotifications(daysOld: number = 30): Promise<{ deletedCount: number }> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await this.notificationRepository.delete({
        status: 'archived',
        created_at: new Date() as any,
      });

      this.logger.log(
        `Cleared ${result.affected || 0} archived notifications older than ${daysOld} days`,
      );

      return { deletedCount: result.affected || 0 };
    } catch (error) {
      this.logger.error(`Failed to clear archived notifications: ${error.message}`);
      throw error;
    }
  }
}
