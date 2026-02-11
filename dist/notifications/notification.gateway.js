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
var NotificationGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const notification_service_1 = require("./notification.service");
let NotificationGateway = NotificationGateway_1 = class NotificationGateway {
    notificationService;
    server;
    logger = new common_1.Logger(NotificationGateway_1.name);
    userSockets = new Map();
    constructor(notificationService) {
        this.notificationService = notificationService;
    }
    afterInit(server) {
        this.logger.log('WebSocket Gateway initialized');
    }
    handleConnection(client) {
        const userId = client.handshake.query.userId;
        if (userId) {
            const userIdNum = parseInt(userId);
            if (!this.userSockets.has(userIdNum)) {
                this.userSockets.set(userIdNum, []);
            }
            const userSocketList = this.userSockets.get(userIdNum);
            if (userSocketList) {
                userSocketList.push(client.id);
                client.join(`user_${userIdNum}`);
                this.logger.log(`User ${userIdNum} connected with socket ${client.id}. Total sockets: ${userSocketList.length}`);
            }
        }
    }
    handleDisconnect(client) {
        const userId = client.handshake.query.userId;
        if (userId) {
            const userIdNum = parseInt(userId);
            const sockets = this.userSockets.get(userIdNum);
            if (sockets) {
                const filteredSockets = sockets.filter((id) => id !== client.id);
                if (filteredSockets.length > 0) {
                    this.userSockets.set(userIdNum, filteredSockets);
                }
                else {
                    this.userSockets.delete(userIdNum);
                }
            }
            this.logger.log(`User ${userIdNum} disconnected. Socket: ${client.id}`);
        }
    }
    async handleMarkAsRead(client, data) {
        const userId = client.handshake.query.userId;
        if (userId) {
            const userIdNum = parseInt(userId);
            await this.notificationService.markAsRead(data.notification_id, userIdNum);
            this.server.to(`user_${userIdNum}`).emit('notification_read', {
                notification_id: data.notification_id,
            });
            return { success: true };
        }
        return { success: false };
    }
    async handleGetUnreadCount(client) {
        const userId = client.handshake.query.userId;
        if (userId) {
            const userIdNum = parseInt(userId);
            const count = await this.notificationService.getUnreadCount(userIdNum);
            return { unread_count: count };
        }
        return { unread_count: 0 };
    }
    sendNotificationToUser(userId, notification) {
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
    sendNotificationToUsers(userIds, notification) {
        userIds.forEach((userId) => {
            this.sendNotificationToUser(userId, notification);
        });
    }
};
exports.NotificationGateway = NotificationGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], NotificationGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('mark_as_read'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], NotificationGateway.prototype, "handleMarkAsRead", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('get_unread_count'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], NotificationGateway.prototype, "handleGetUnreadCount", null);
exports.NotificationGateway = NotificationGateway = NotificationGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
            credentials: true,
        },
        transports: ['websocket', 'polling'],
    }),
    __param(0, (0, common_1.Inject)((0, common_1.forwardRef)(() => notification_service_1.NotificationService))),
    __metadata("design:paramtypes", [notification_service_1.NotificationService])
], NotificationGateway);
//# sourceMappingURL=notification.gateway.js.map