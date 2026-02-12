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
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const conversation_entity_1 = require("./entities/conversation.entity");
const message_entity_1 = require("./entities/message.entity");
const message_read_status_entity_1 = require("./entities/message-read-status.entity");
const toxic_filter_service_1 = require("../toxic-filter/toxic-filter.service");
let ChatService = class ChatService {
    conversationRepository;
    messageRepository;
    messageReadStatusRepository;
    toxicFilterService;
    constructor(conversationRepository, messageRepository, messageReadStatusRepository, toxicFilterService) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.messageReadStatusRepository = messageReadStatusRepository;
        this.toxicFilterService = toxicFilterService;
    }
    async getOrCreateConversation(senderId, receiverId, subject) {
        if (senderId === receiverId) {
            throw new common_1.BadRequestException('Cannot create conversation with self');
        }
        let conversation = await this.conversationRepository.findOne({
            where: [
                { senderId, receiverId },
                { senderId: receiverId, receiverId: senderId },
            ],
            relations: ['sender', 'receiver'],
        });
        if (!conversation) {
            conversation = this.conversationRepository.create({
                senderId,
                receiverId,
                subject: subject || undefined,
                isActive: true,
            });
            await this.conversationRepository.save(conversation);
            const savedConversation = await this.conversationRepository.findOne({
                where: { id: conversation.id },
                relations: ['sender', 'receiver'],
            });
            if (!savedConversation) {
                throw new common_1.NotFoundException('Failed to create conversation');
            }
            conversation = savedConversation;
        }
        return conversation;
    }
    async updateConversationStatus(conversationId, status) {
        const conversation = await this.conversationRepository.findOne({
            where: { id: conversationId },
        });
        if (!conversation) {
            throw new common_1.NotFoundException('Conversation not found');
        }
        conversation.status = status;
        return await this.conversationRepository.save(conversation);
    }
    async getUserConversations(userId, skip = 0, take = 20) {
        const conversations = await this.conversationRepository
            .createQueryBuilder('c')
            .leftJoinAndSelect('c.sender', 'sender')
            .leftJoinAndSelect('c.receiver', 'receiver')
            .where('(c.senderId = :userId OR c.receiverId = :userId)', { userId })
            .andWhere('c.isActive = :isActive', { isActive: true })
            .orderBy('c.lastMessageAt', 'DESC')
            .skip(skip)
            .take(take)
            .getMany();
        const conversationsWithMessages = await Promise.all(conversations.map(async (conv) => {
            const lastMessage = await this.messageRepository.findOne({
                where: { conversationId: conv.id, isDeleted: false },
                order: { createdAt: 'DESC' },
                relations: ['sender'],
            });
            const unreadCount = await this.messageRepository.count({
                where: {
                    conversationId: conv.id,
                    receiverId: userId,
                    isDeleted: false,
                },
            });
            const unreadMessages = await this.messageReadStatusRepository
                .createQueryBuilder('mrs')
                .where('mrs.messageId IN (:...messageIds)', {
                messageIds: [lastMessage?.id || 0],
            })
                .andWhere('mrs.userId = :userId', { userId })
                .andWhere('mrs.isRead = :isRead', { isRead: false })
                .getMany();
            return {
                ...conv,
                lastMessage,
                unreadCount: unreadMessages.length > 0 ? unreadCount : 0,
            };
        }));
        return conversationsWithMessages;
    }
    async getConversation(conversationId, userId, limit = 50) {
        const conversation = await this.conversationRepository
            .createQueryBuilder('c')
            .leftJoinAndSelect('c.sender', 'sender')
            .leftJoinAndSelect('c.receiver', 'receiver')
            .where('c.id = :conversationId', { conversationId })
            .getOne();
        if (!conversation) {
            throw new common_1.NotFoundException('Conversation not found');
        }
        const isParticipant = conversation.senderId === userId || conversation.receiverId === userId;
        if (!isParticipant) {
            throw new common_1.ForbiddenException('You are not part of this conversation');
        }
        const messages = await this.messageRepository.find({
            where: { conversationId, isDeleted: false },
            relations: ['sender', 'receiver', 'readStatuses'],
            order: { createdAt: 'DESC' },
            take: limit,
        });
        return {
            conversation,
            messages: messages.reverse(),
        };
    }
    async sendMessage(senderId, dto) {
        const { conversationId, receiverId, content, messageType, fileUrl, fileName, fileSize } = dto;
        const conversation = await this.conversationRepository.findOne({
            where: { id: conversationId },
        });
        if (!conversation) {
            throw new common_1.NotFoundException('Conversation not found');
        }
        const isParticipant = (conversation.senderId === senderId && conversation.receiverId === receiverId) ||
            (conversation.receiverId === senderId && conversation.senderId === receiverId);
        if (!isParticipant) {
            throw new common_1.ForbiddenException('You are not part of this conversation');
        }
        let messageContent = content;
        let isFlaggedAsToxic = false;
        if (messageType === 'text' && content) {
            try {
                const toxicResult = await this.toxicFilterService.detectToxic(content);
                if (toxicResult.isToxic) {
                    isFlaggedAsToxic = true;
                    messageContent = toxicResult.filteredText;
                    console.log(`[TOXIC CONTENT DETECTED] From user ${senderId}: ${toxicResult.foundWords.map(w => w.word).join(', ')}`);
                }
            }
            catch (error) {
                console.error('Error checking toxic content:', error);
            }
        }
        const message = this.messageRepository.create({
            conversationId,
            senderId,
            receiverId,
            content: messageContent,
            messageType,
            ...(fileUrl && { fileUrl }),
            ...(fileName && { fileName }),
            ...(fileSize && { fileSize }),
        });
        await this.messageRepository.save(message);
        const readStatus = this.messageReadStatusRepository.create({
            messageId: message.id,
            userId: receiverId,
            isDelivered: true,
            isRead: false,
        });
        await this.messageReadStatusRepository.save(readStatus);
        await this.conversationRepository.update({ id: conversationId }, { lastMessageId: message.id, lastMessageAt: new Date() });
        const savedMessage = await this.messageRepository.findOne({
            where: { id: message.id },
            relations: ['sender', 'receiver', 'readStatuses'],
        });
        if (!savedMessage) {
            throw new common_1.NotFoundException('Failed to retrieve saved message');
        }
        if (isFlaggedAsToxic) {
            savedMessage.isFlaggedAsToxic = true;
        }
        return savedMessage;
    }
    async sendVoiceMessage(senderId, conversationId, voiceUrl, fileName, fileSize, duration) {
        const conversation = await this.conversationRepository.findOne({
            where: { id: conversationId },
            relations: ['sender', 'receiver'],
        });
        if (!conversation) {
            throw new common_1.NotFoundException('Conversation not found');
        }
        let receiverId;
        if (conversation.senderId === senderId) {
            receiverId = conversation.receiverId;
        }
        else if (conversation.receiverId === senderId) {
            receiverId = conversation.senderId;
        }
        else {
            throw new common_1.ForbiddenException('You are not part of this conversation');
        }
        const message = this.messageRepository.create({
            conversationId,
            senderId,
            receiverId,
            content: '[Voice Message]',
            messageType: message_entity_1.MessageType.VOICE,
            fileUrl: voiceUrl,
            fileName,
            fileSize,
            duration,
        });
        await this.messageRepository.save(message);
        const readStatus = this.messageReadStatusRepository.create({
            messageId: message.id,
            userId: receiverId,
            isDelivered: true,
            isRead: false,
        });
        await this.messageReadStatusRepository.save(readStatus);
        await this.conversationRepository.update({ id: conversationId }, { lastMessageId: message.id, lastMessageAt: new Date() });
        const savedMessage = await this.messageRepository.findOne({
            where: { id: message.id },
            relations: ['sender', 'receiver', 'readStatuses'],
        });
        if (!savedMessage) {
            throw new common_1.NotFoundException('Failed to retrieve saved message');
        }
        return savedMessage;
    }
    async updateMessage(messageId, senderId, dto) {
        const message = await this.messageRepository.findOne({
            where: { id: messageId },
        });
        if (!message) {
            throw new common_1.NotFoundException('Message not found');
        }
        if (message.senderId !== senderId) {
            throw new common_1.ForbiddenException('You can only edit your own messages');
        }
        if (message.isDeleted) {
            throw new common_1.BadRequestException('Cannot edit deleted message');
        }
        await this.messageRepository.update({ id: messageId }, {
            content: dto.content || message.content,
            isEdited: true,
            editedAt: new Date(),
        });
        const updatedMessage = await this.messageRepository.findOne({
            where: { id: messageId },
            relations: ['sender', 'receiver', 'readStatuses'],
        });
        if (!updatedMessage) {
            throw new common_1.NotFoundException('Failed to retrieve updated message');
        }
        return updatedMessage;
    }
    async deleteMessage(messageId, senderId) {
        const message = await this.messageRepository.findOne({
            where: { id: messageId },
        });
        if (!message) {
            throw new common_1.NotFoundException('Message not found');
        }
        if (message.senderId !== senderId) {
            throw new common_1.ForbiddenException('You can only delete your own messages');
        }
        await this.messageRepository.update({ id: messageId }, {
            isDeleted: true,
            deletedAt: new Date(),
            content: '[Message deleted]',
        });
    }
    async markAsRead(messageId, userId) {
        let readStatus = await this.messageReadStatusRepository.findOne({
            where: { messageId, userId },
        });
        if (!readStatus) {
            throw new common_1.NotFoundException('Read status not found');
        }
        if (readStatus.isRead) {
            return readStatus;
        }
        await this.messageReadStatusRepository.update({ id: readStatus.id }, {
            isRead: true,
            readAt: new Date(),
        });
        const updatedReadStatus = await this.messageReadStatusRepository.findOne({
            where: { id: readStatus.id },
        });
        if (!updatedReadStatus) {
            throw new common_1.NotFoundException('Failed to retrieve updated read status');
        }
        return updatedReadStatus;
    }
    async markConversationAsRead(conversationId, userId) {
        const unreadMessages = await this.messageRepository
            .createQueryBuilder('m')
            .where('m.conversationId = :conversationId', { conversationId })
            .andWhere('m.receiverId = :userId', { userId })
            .andWhere('m.isDeleted = :isDeleted', { isDeleted: false })
            .getMany();
        if (unreadMessages.length === 0) {
            return;
        }
        const messageIds = unreadMessages.map((m) => m.id);
        await this.messageReadStatusRepository
            .createQueryBuilder()
            .update()
            .set({
            isRead: true,
            readAt: new Date(),
        })
            .where('messageId IN (:...messageIds)', { messageIds })
            .andWhere('userId = :userId', { userId })
            .andWhere('isRead = :isRead', { isRead: false })
            .execute();
    }
    async getUnreadCount(userId) {
        return await this.messageReadStatusRepository.count({
            where: {
                userId,
                isRead: false,
            },
        });
    }
    async getUnreadByConversation(userId) {
        const unreadGroups = await this.messageReadStatusRepository
            .createQueryBuilder('mrs')
            .leftJoinAndSelect(message_entity_1.Message, 'm', 'm.id = mrs.messageId')
            .where('mrs.userId = :userId', { userId })
            .andWhere('mrs.isRead = :isRead', { isRead: false })
            .groupBy('m.conversationId')
            .addSelect('m.conversationId', 'conversationId')
            .addSelect('COUNT(*)', 'count')
            .getRawMany();
        return unreadGroups;
    }
    async searchMessages(conversationId, userId, query, limit = 20) {
        const conversation = await this.conversationRepository.findOne({
            where: { id: conversationId },
        });
        if (!conversation) {
            throw new common_1.NotFoundException('Conversation not found');
        }
        const isParticipant = conversation.senderId === userId || conversation.receiverId === userId;
        if (!isParticipant) {
            throw new common_1.ForbiddenException('You are not part of this conversation');
        }
        return await this.messageRepository
            .createQueryBuilder('m')
            .where('m.conversationId = :conversationId', { conversationId })
            .andWhere('m.isDeleted = :isDeleted', { isDeleted: false })
            .andWhere('m.content ILIKE :query', { query: `%${query}%` })
            .orderBy('m.createdAt', 'DESC')
            .take(limit)
            .getMany();
    }
    async deleteConversation(conversationId, userId) {
        const conversation = await this.conversationRepository.findOne({
            where: { id: conversationId },
        });
        if (!conversation) {
            throw new common_1.NotFoundException('Conversation not found');
        }
        const isParticipant = conversation.senderId === userId || conversation.receiverId === userId;
        if (!isParticipant) {
            throw new common_1.ForbiddenException('You are not part of this conversation');
        }
        await this.conversationRepository.update({ id: conversationId }, { isActive: false });
    }
    async getMessageCount() {
        return await this.messageRepository.count({
            where: { isDeleted: false },
        });
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(conversation_entity_1.Conversation)),
    __param(1, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __param(2, (0, typeorm_1.InjectRepository)(message_read_status_entity_1.MessageReadStatus)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        toxic_filter_service_1.ToxicFilterService])
], ChatService);
//# sourceMappingURL=chat.service.js.map