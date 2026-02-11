import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { NotificationType } from './entities/notification.entity';
import { Notification } from './entities/notification.entity';

@ApiTags('Notifications')
@Controller('v1/notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  /**
   * Get user's notifications with pagination
   */
  @Get()
  @ApiOperation({
    summary: 'Get user notifications',
    description: 'Retrieve paginated list of notifications for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Notifications retrieved successfully',
    schema: {
      example: {
        data: [
          {
            id: 1,
            type: 'reservasi_approved',
            title: 'Reservasi Disetujui',
            message: 'Reservasi konseling Anda telah disetujui',
            status: 'unread',
            created_at: '2024-02-15T10:30:00Z',
          },
        ],
        total: 5,
      },
    },
  })
  async getNotifications(
    @Request() req: any,
    @Query('limit') limit: number = 20,
    @Query('offset') offset: number = 0,
  ) {
    const userId = req.user.id;
    return await this.notificationService.findUserNotifications(userId, limit, offset);
  }

  /**
   * Get unread notifications count
   */
  @Get('unread/count')
  @ApiOperation({
    summary: 'Get unread notification count',
    description: 'Get the count of unread notifications for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Unread count retrieved successfully',
    schema: {
      example: {
        unread_count: 3,
      },
    },
  })
  async getUnreadCount(@Request() req: any) {
    const userId = req.user.id;
    const count = await this.notificationService.getUnreadCount(userId);
    return { unread_count: count };
  }

  /**
   * Get unread notifications
   */
  @Get('unread')
  @ApiOperation({
    summary: 'Get unread notifications',
    description: 'Retrieve list of unread notifications',
  })
  @ApiResponse({
    status: 200,
    description: 'Unread notifications retrieved successfully',
    schema: {
      example: {
        data: [],
        total: 0,
      },
    },
  })
  async getUnreadNotifications(
    @Request() req: any,
    @Query('limit') limit: number = 20,
  ) {
    const userId = req.user.id;
    return await this.notificationService.findUnreadNotifications(userId, limit);
  }

  /**
   * Get notifications by type
   */
  @Get('type/:type')
  @ApiOperation({
    summary: 'Filter notifications by type',
    description: 'Get notifications filtered by type (e.g., reservasi_approved, decision_made)',
  })
  @ApiResponse({
    status: 200,
    description: 'Filtered notifications retrieved successfully',
  })
  async getNotificationsByType(
    @Request() req: any,
    @Param('type') type: NotificationType,
    @Query('limit') limit: number = 20,
    @Query('offset') offset: number = 0,
  ) {
    const userId = req.user.id;
    return await this.notificationService.findByType(userId, type, limit, offset);
  }

  /**
   * Mark single notification as read
   */
  @Patch(':id/read')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Mark notification as read',
    description: 'Mark a single notification as read',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as read successfully',
    type: Notification,
  })
  async markAsRead(
    @Request() req: any,
    @Param('id') notificationId: number,
  ) {
    const userId = req.user.id;
    return await this.notificationService.markAsRead(notificationId, userId);
  }

  /**
   * Mark all notifications as read
   */
  @Patch('read-all')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Mark all notifications as read',
    description: 'Mark all unread notifications as read for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'All notifications marked as read',
    schema: {
      example: {
        affectedRows: 5,
      },
    },
  })
  async markAllAsRead(@Request() req: any) {
    const userId = req.user.id;
    return await this.notificationService.bulkMarkAsRead(userId);
  }

  /**
   * Archive a notification
   */
  @Delete(':id')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Archive notification',
    description: 'Archive a notification (soft delete)',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification archived successfully',
    type: Notification,
  })
  async archiveNotification(
    @Request() req: any,
    @Param('id') notificationId: number,
  ) {
    const userId = req.user.id;
    return await this.notificationService.archive(notificationId, userId);
  }
}
