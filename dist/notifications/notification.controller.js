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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const notification_service_1 = require("./notification.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const notification_entity_1 = require("./entities/notification.entity");
let NotificationController = class NotificationController {
    notificationService;
    constructor(notificationService) {
        this.notificationService = notificationService;
    }
    async getNotifications(req, limit = 20, offset = 0) {
        const userId = req.user.id;
        return await this.notificationService.findUserNotifications(userId, limit, offset);
    }
    async getUnreadCount(req) {
        const userId = req.user.id;
        const count = await this.notificationService.getUnreadCount(userId);
        return { unread_count: count };
    }
    async getUnreadNotifications(req, limit = 20) {
        const userId = req.user.id;
        return await this.notificationService.findUnreadNotifications(userId, limit);
    }
    async getNotificationsByType(req, type, limit = 20, offset = 0) {
        const userId = req.user.id;
        return await this.notificationService.findByType(userId, type, limit, offset);
    }
    async markAsRead(req, notificationId) {
        const userId = req.user.id;
        return await this.notificationService.markAsRead(notificationId, userId);
    }
    async markAllAsRead(req) {
        const userId = req.user.id;
        return await this.notificationService.bulkMarkAsRead(userId);
    }
    async archiveNotification(req, notificationId) {
        const userId = req.user.id;
        return await this.notificationService.archive(notificationId, userId);
    }
};
exports.NotificationController = NotificationController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get user notifications',
        description: 'Retrieve paginated list of notifications for the authenticated user',
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getNotifications", null);
__decorate([
    (0, common_1.Get)('unread/count'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get unread notification count',
        description: 'Get the count of unread notifications for the authenticated user',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Unread count retrieved successfully',
        schema: {
            example: {
                unread_count: 3,
            },
        },
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getUnreadCount", null);
__decorate([
    (0, common_1.Get)('unread'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get unread notifications',
        description: 'Retrieve list of unread notifications',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Unread notifications retrieved successfully',
        schema: {
            example: {
                data: [],
                total: 0,
            },
        },
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getUnreadNotifications", null);
__decorate([
    (0, common_1.Get)('type/:type'),
    (0, swagger_1.ApiOperation)({
        summary: 'Filter notifications by type',
        description: 'Get notifications filtered by type (e.g., reservasi_approved, decision_made)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Filtered notifications retrieved successfully',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('type')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number, Number]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getNotificationsByType", null);
__decorate([
    (0, common_1.Patch)(':id/read'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({
        summary: 'Mark notification as read',
        description: 'Mark a single notification as read',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Notification marked as read successfully',
        type: notification_entity_1.Notification,
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Patch)('read-all'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({
        summary: 'Mark all notifications as read',
        description: 'Mark all unread notifications as read for the authenticated user',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'All notifications marked as read',
        schema: {
            example: {
                affectedRows: 5,
            },
        },
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "markAllAsRead", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({
        summary: 'Archive notification',
        description: 'Archive a notification (soft delete)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Notification archived successfully',
        type: notification_entity_1.Notification,
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "archiveNotification", null);
exports.NotificationController = NotificationController = __decorate([
    (0, swagger_1.ApiTags)('Notifications'),
    (0, common_1.Controller)('v1/notifications'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [notification_service_1.NotificationService])
], NotificationController);
//# sourceMappingURL=notification.controller.js.map