"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const notification_entity_1 = require("./entities/notification.entity");
const notification_gateway_1 = require("./notification.gateway");
let NotificationService = NotificationService_1 = class NotificationService {
    notificationRepository;
    notificationGateway;
    logger = new common_1.Logger(NotificationService_1.name);
    constructor(notificationRepository, notificationGateway) {
        this.notificationRepository = notificationRepository;
        this.notificationGateway = notificationGateway;
    }
    async create(createNotificationDto) {
        try {
            const notification = this.notificationRepository.create(createNotificationDto);
            const savedNotification = await this.notificationRepository.save(notification);
            this.notificationGateway.sendNotificationToUser(createNotificationDto.recipient_id, savedNotification);
            this.logger.log(`Notification created for user ${createNotificationDto.recipient_id}: ${createNotificationDto.title}`);
            return savedNotification;
        }
        catch (error) {
            this.logger.error(`Failed to create notification: ${error.message}`);
            throw error;
        }
    }
    async createMultiple(notifications) {
        try {
            const savedNotifications = await this.notificationRepository.save(notifications.map((dto) => this.notificationRepository.create(dto)));
            savedNotifications.forEach((notification) => {
                this.notificationGateway.sendNotificationToUser(notification.recipient_id, notification);
            });
            this.logger.log(`${savedNotifications.length} notifications created and broadcasted`);
            return savedNotifications;
        }
        catch (error) {
            this.logger.error(`Failed to create multiple notifications: ${error.message}`);
            throw error;
        }
    }
    async markAsRead(notificationId, userId) {
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
        }
        catch (error) {
            this.logger.error(`Failed to mark notification as read: ${error.message}`);
            throw error;
        }
    }
    async bulkMarkAsRead(userId) {
        try {
            const result = await this.notificationRepository.update({
                recipient_id: userId,
                status: 'unread',
            }, {
                status: 'read',
                read_at: new Date(),
            });
            const affectedRows = result.affected || 0;
            this.logger.log(`Marked ${affectedRows} notifications as read for user ${userId}`);
            return { affectedRows };
        }
        catch (error) {
            this.logger.error(`Failed to bulk mark notifications as read: ${error.message}`);
            throw error;
        }
    }
    async getUnreadCount(userId) {
        try {
            const count = await this.notificationRepository.countBy({
                recipient_id: userId,
                status: 'unread',
            });
            return count;
        }
        catch (error) {
            this.logger.error(`Failed to get unread count: ${error.message}`);
            throw error;
        }
    }
    async findUserNotifications(userId, limit = 20, offset = 0) {
        try {
            const [data, total] = await this.notificationRepository.findAndCount({
                where: { recipient_id: userId },
                order: { created_at: 'DESC' },
                take: limit,
                skip: offset,
            });
            return { data, total };
        }
        catch (error) {
            this.logger.error(`Failed to find user notifications: ${error.message}`);
            throw error;
        }
    }
    async findUnreadNotifications(userId, limit = 20) {
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
        }
        catch (error) {
            this.logger.error(`Failed to find unread notifications: ${error.message}`);
            throw error;
        }
    }
    async findByType(userId, type, limit = 20, offset = 0) {
        try {
            const [data, total] = await this.notificationRepository.findAndCount({
                where: { recipient_id: userId, type },
                order: { created_at: 'DESC' },
                take: limit,
                skip: offset,
            });
            return { data, total };
        }
        catch (error) {
            this.logger.error(`Failed to find notifications by type: ${error.message}`);
            throw error;
        }
    }
    async archive(notificationId, userId) {
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
        }
        catch (error) {
            this.logger.error(`Failed to archive notification: ${error.message}`);
            throw error;
        }
    }
    async delete(notificationId, userId) {
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
        }
        catch (error) {
            this.logger.error(`Failed to delete notification: ${error.message}`);
            throw error;
        }
    }
    async findByRelatedId(relatedId, relatedType) {
        try {
            const notifications = await this.notificationRepository.find({
                where: { related_id: relatedId, related_type: relatedType },
                order: { created_at: 'DESC' },
            });
            return notifications;
        }
        catch (error) {
            this.logger.error(`Failed to find notifications by related ID: ${error.message}`);
            throw error;
        }
    }
    async clearArchivedNotifications(daysOld = 30) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);
            const result = await this.notificationRepository.delete({
                status: 'archived',
                created_at: new Date(),
            });
            this.logger.log(`Cleared ${result.affected || 0} archived notifications older than ${daysOld} days`);
            return { deletedCount: result.affected || 0 };
        }
        catch (error) {
            this.logger.error(`Failed to clear archived notifications: ${error.message}`);
            throw error;
        }
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => notification_gateway_1.NotificationGateway))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        notification_gateway_1.NotificationGateway])
], NotificationService);
//# sourceMappingURL=notification.service.js.map