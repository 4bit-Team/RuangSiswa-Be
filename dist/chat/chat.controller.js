"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const chat_service_1 = require("./chat.service");
const chat_gateway_1 = require("./chat.gateway");
const create_message_dto_1 = require("./dto/create-message.dto");
const conversation_dto_1 = require("./dto/conversation.dto");
const update_message_dto_1 = require("./dto/update-message.dto");
let ChatController = class ChatController {
    chatService;
    chatGateway;
    constructor(chatService, chatGateway) {
        this.chatService = chatService;
        this.chatGateway = chatGateway;
    }
    async getUserConversations(req, skip = 0, take = 20) {
        return await this.chatService.getUserConversations(req.user.id, skip, take);
    }
    async createConversation(req, dto) {
        return await this.chatService.getOrCreateConversation(req.user.id, dto.receiverId, dto.subject);
    }
    async getConversation(req, conversationId, limit = 50) {
        return await this.chatService.getConversation(conversationId, req.user.id, limit);
    }
    async deleteConversation(req, conversationId) {
        await this.chatService.deleteConversation(conversationId, req.user.id);
    }
    async sendMessage(req, dto) {
        const message = await this.chatService.sendMessage(req.user.id, dto);
        this.chatGateway.notifyConversation(dto.conversationId, 'message-received', {
            message,
            conversationId: dto.conversationId,
            timestamp: new Date(),
        });
        this.chatGateway.notifyUser(dto.receiverId, 'new-message', {
            message,
            conversationId: dto.conversationId,
            senderId: req.user.id,
            timestamp: new Date(),
        });
        return message;
    }
    async updateMessage(req, messageId, dto) {
        return await this.chatService.updateMessage(messageId, req.user.id, dto);
    }
    async deleteMessage(req, messageId) {
        await this.chatService.deleteMessage(messageId, req.user.id);
    }
    async markAsRead(req, messageId) {
        return await this.chatService.markAsRead(messageId, req.user.id);
    }
    async markConversationAsRead(req, conversationId) {
        await this.chatService.markConversationAsRead(conversationId, req.user.id);
        return { message: 'Conversation marked as read' };
    }
    async getUnreadCount(req) {
        const count = await this.chatService.getUnreadCount(req.user.id);
        return { unreadCount: count };
    }
    async getUnreadByConversation(req) {
        return await this.chatService.getUnreadByConversation(req.user.id);
    }
    async getMessageCount() {
        const count = await this.chatService.getMessageCount();
        return { count };
    }
    async searchMessages(req, conversationId, query, limit = 20) {
        return await this.chatService.searchMessages(conversationId, req.user.id, query, limit);
    }
    async sendVoiceMessage(req, file, body) {
        if (!file) {
            throw new common_1.BadRequestException('No audio file uploaded');
        }
        const conversationId = parseInt(body.conversationId);
        const duration = parseInt(body.duration) || 0;
        const messageType = body.messageType || 'voice';
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
        const voiceUrl = `${backendUrl}/uploads/voices/${file.filename}`;
        const message = await this.chatService.sendVoiceMessage(req.user.id, conversationId, voiceUrl, file.filename, file.size, duration);
        this.chatGateway.notifyConversation(conversationId, 'message-received', {
            message,
            conversationId,
            timestamp: new Date(),
        });
        this.chatGateway.notifyUser(message.receiverId, 'new-message', {
            message,
            conversationId,
            senderId: req.user.id,
            timestamp: new Date(),
        });
        return message;
    }
};
exports.ChatController = ChatController;
__decorate([
    (0, common_1.Get)('conversations'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('skip', new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)('take', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getUserConversations", null);
__decorate([
    (0, common_1.Post)('conversations'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, conversation_dto_1.ConversationDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "createConversation", null);
__decorate([
    (0, common_1.Get)('conversations/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getConversation", null);
__decorate([
    (0, common_1.Delete)('conversations/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "deleteConversation", null);
__decorate([
    (0, common_1.Post)('messages'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_message_dto_1.CreateMessageDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Put)('messages/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, update_message_dto_1.UpdateMessageDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "updateMessage", null);
__decorate([
    (0, common_1.Delete)('messages/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "deleteMessage", null);
__decorate([
    (0, common_1.Put)('messages/:id/read'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Put)('conversations/:id/mark-read'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "markConversationAsRead", null);
__decorate([
    (0, common_1.Get)('unread-count'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getUnreadCount", null);
__decorate([
    (0, common_1.Get)('unread-by-conversation'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getUnreadByConversation", null);
__decorate([
    (0, common_1.Get)('count'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getMessageCount", null);
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('conversationId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('query')),
    __param(3, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, String, Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "searchMessages", null);
__decorate([
    (0, common_1.Post)('messages/send-voice'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                const uploadPath = path.join(__dirname, '..', '..', 'uploads', 'voices');
                if (!fs.existsSync(uploadPath)) {
                    fs.mkdirSync(uploadPath, { recursive: true });
                }
                cb(null, uploadPath);
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, `voice-${uniqueSuffix}.webm`);
            },
        }),
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.match(/audio\/(webm|mpeg|wav|ogg)/)) {
                cb(new common_1.BadRequestException('Only audio files are allowed!'), false);
            }
            else {
                cb(null, true);
            }
        },
        limits: {
            fileSize: 10 * 1024 * 1024,
        },
    })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "sendVoiceMessage", null);
exports.ChatController = ChatController = __decorate([
    (0, common_1.Controller)('chat'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [chat_service_1.ChatService,
        chat_gateway_1.ChatGateway])
], ChatController);
//# sourceMappingURL=chat.controller.js.map