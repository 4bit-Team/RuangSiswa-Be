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
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const chat_service_1 = require("./chat.service");
const create_message_dto_1 = require("./dto/create-message.dto");
const rate_limiter_1 = require("./rate-limiter");
const ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'https://ruangsiswa.my.id',
    'http://ruangsiswa.my.id',
];
let ChatGateway = class ChatGateway {
    jwtService;
    chatService;
    server;
    onlineUsers = new Map();
    messageLimiter;
    constructor(jwtService, chatService) {
        this.jwtService = jwtService;
        this.chatService = chatService;
        this.messageLimiter = new rate_limiter_1.RateLimiter({
            windowMs: 60000,
            maxRequests: 50,
            message: 'Too many messages sent. Please try again later.',
        });
    }
    getJwtSecret() {
        const secret = process.env.JWT_SECRET || 'your-secret-key';
        if (!secret || secret === 'your-secret-key') {
            console.warn('[WebSocket] ⚠️ WARNING: Using default JWT secret. Set JWT_SECRET environment variable!');
        }
        return secret;
    }
    afterInit() {
        console.log('[WebSocket] Chat gateway initialized');
        this.server.on('error', (error) => {
            console.error('[Chat] Server error:', error);
        });
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth.token;
            if (!token) {
                console.error('[WebSocket] No token provided');
                client.disconnect();
                return;
            }
            let payload;
            try {
                payload = this.jwtService.verify(token, {
                    secret: this.getJwtSecret(),
                });
                console.log('[WebSocket] JWT Payload:', payload);
            }
            catch (jwtError) {
                console.error('[WebSocket] JWT verification error:', jwtError.message);
                client.disconnect();
                return;
            }
            client.userId = payload.id || payload.sub || payload.userId;
            if (!client.userId) {
                console.error('[WebSocket] No userId found in JWT payload:', payload);
                client.disconnect();
                return;
            }
            this.onlineUsers.set(client.userId, client.id);
            this.server.emit('user-online', {
                userId: client.userId,
                socketId: client.id,
                timestamp: new Date(),
            });
            console.log(`[WebSocket] User ${client.userId} connected with socket ${client.id}`);
            client.join(`user-${client.userId}`);
        }
        catch (error) {
            console.error('[WebSocket] Authentication failed:', error instanceof Error ? error.message : String(error));
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        if (client.userId) {
            this.onlineUsers.delete(client.userId);
            this.server.emit('user-offline', {
                userId: client.userId,
                timestamp: new Date(),
            });
            console.log(`[WebSocket] User ${client.userId} disconnected from /chat namespace`);
        }
        else {
            console.warn(`[WebSocket] Unknown user disconnected`);
        }
    }
    handleError(client, error) {
        console.error(`[WebSocket] Connection error for user ${client.userId}:`, error);
    }
    handleJoinConversation(client, data) {
        const roomName = `conversation-${data.conversationId}`;
        client.join(roomName);
        console.log(`[WebSocket] User ${client.userId} joined conversation ${data.conversationId}`);
        this.server.to(roomName).emit('user-joined', {
            userId: client.userId,
            conversationId: data.conversationId,
            timestamp: new Date(),
        });
        return { status: 'joined', conversationId: data.conversationId };
    }
    handleLeaveConversation(client, data) {
        const roomName = `conversation-${data.conversationId}`;
        client.leave(roomName);
        console.log(`[WebSocket] User ${client.userId} left conversation ${data.conversationId}`);
        this.server.to(roomName).emit('user-left', {
            userId: client.userId,
            conversationId: data.conversationId,
            timestamp: new Date(),
        });
        return { status: 'left', conversationId: data.conversationId };
    }
    async handleSendMessage(client, data) {
        try {
            const userBlock = this.messageLimiter.isBlocked(client.userId);
            if (userBlock.blocked) {
                console.warn(`🚫 [ChatGateway] Blocked user ${client.userId} attempted message`);
                return {
                    status: 'error',
                    message: `You are temporarily blocked: ${userBlock.reason}`,
                };
            }
            const rateCheck = this.messageLimiter.check(`msg:${client.userId}`);
            if (!rateCheck.allowed) {
                console.warn(`⚠️ [ChatGateway] Rate limit exceeded for user ${client.userId}`);
                this.messageLimiter.blockUser(client.userId, 300000, 'Message rate limit exceeded');
                return {
                    status: 'error',
                    message: rateCheck.message,
                };
            }
            const message = await this.chatService.sendMessage(client.userId, data);
            const conversationRoom = `conversation-${data.conversationId}`;
            this.server.to(conversationRoom).emit('message-received', {
                message,
                conversationId: data.conversationId,
                timestamp: new Date(),
            });
            this.server.to(`user-${data.receiverId}`).emit('new-message', {
                message,
                conversationId: data.conversationId,
                senderId: client.userId,
                timestamp: new Date(),
            });
            console.log(`[WebSocket] Message sent from ${client.userId} to ${data.receiverId} in conversation ${data.conversationId}`);
            return {
                status: 'sent',
                message,
            };
        }
        catch (error) {
            console.error('[WebSocket] Error sending message:', error.message);
            return {
                status: 'error',
                message: error.message,
            };
        }
    }
    handleUserTyping(client, data) {
        const roomName = `conversation-${data.conversationId}`;
        this.server.to(roomName).emit('user-typing', {
            userId: client.userId,
            conversationId: data.conversationId,
            timestamp: new Date(),
        });
        return { status: 'typing' };
    }
    handleUserStoppedTyping(client, data) {
        const roomName = `conversation-${data.conversationId}`;
        this.server.to(roomName).emit('user-stopped-typing', {
            userId: client.userId,
            conversationId: data.conversationId,
            timestamp: new Date(),
        });
        return { status: 'stopped-typing' };
    }
    async handleMarkAsRead(client, data) {
        try {
            const readStatus = await this.chatService.markAsRead(data.messageId, client.userId);
            const roomName = `conversation-${data.conversationId}`;
            this.server.to(roomName).emit('message-read', {
                messageId: data.messageId,
                userId: client.userId,
                conversationId: data.conversationId,
                readAt: readStatus.readAt,
                timestamp: new Date(),
            });
            return { status: 'marked-as-read' };
        }
        catch (error) {
            console.error('[WebSocket] Error marking as read:', error.message);
            return { status: 'error', message: error.message };
        }
    }
    async handleMarkConversationAsRead(client, data) {
        try {
            await this.chatService.markConversationAsRead(data.conversationId, client.userId);
            const roomName = `conversation-${data.conversationId}`;
            this.server.to(roomName).emit('conversation-read', {
                userId: client.userId,
                conversationId: data.conversationId,
                timestamp: new Date(),
            });
            return { status: 'conversation-marked-as-read' };
        }
        catch (error) {
            console.error('[WebSocket] Error marking conversation as read:', error.message);
            return { status: 'error', message: error.message };
        }
    }
    async handleDeleteMessage(client, data) {
        try {
            await this.chatService.deleteMessage(data.messageId, client.userId);
            const roomName = `conversation-${data.conversationId}`;
            this.server.to(roomName).emit('message-deleted', {
                messageId: data.messageId,
                conversationId: data.conversationId,
                timestamp: new Date(),
            });
            return { status: 'deleted' };
        }
        catch (error) {
            console.error('[WebSocket] Error deleting message:', error.message);
            return { status: 'error', message: error.message };
        }
    }
    handleGetOnlineUsers(client, data) {
        const onlineUserIds = Array.from(this.onlineUsers.keys());
        return {
            conversationId: data.conversationId,
            onlineUsers: onlineUserIds,
            timestamp: new Date(),
        };
    }
    handleGetUserStatus(client, data) {
        const isOnline = this.onlineUsers.has(data.userId);
        return {
            userId: data.userId,
            isOnline,
            timestamp: new Date(),
        };
    }
    notifyUser(userId, event, data) {
        this.server.to(`user-${userId}`).emit(event, data);
    }
    notifyConversation(conversationId, event, data) {
        this.server.to(`conversation-${conversationId}`).emit(event, data);
    }
    getOnlineUsersCount() {
        return this.onlineUsers.size;
    }
    isUserOnline(userId) {
        return this.onlineUsers.has(userId);
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join-conversation'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleJoinConversation", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave-conversation'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleLeaveConversation", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('send-message'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_message_dto_1.CreateMessageDto]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleSendMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('user-typing'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleUserTyping", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('user-stopped-typing'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleUserStoppedTyping", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('mark-as-read'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleMarkAsRead", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('mark-conversation-read'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleMarkConversationAsRead", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('delete-message'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleDeleteMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('get-online-users'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleGetOnlineUsers", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('get-user-status'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleGetUserStatus", null);
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: ALLOWED_ORIGINS,
            methods: ['GET', 'POST'],
            credentials: true,
        },
        namespace: '/chat',
        pingInterval: 25000,
        pingTimeout: 5000,
    }),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        chat_service_1.ChatService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map