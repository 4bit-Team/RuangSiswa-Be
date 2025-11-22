import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { MessageReadStatus } from './entities/message-read-status.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { ConversationDto } from './dto/conversation.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(MessageReadStatus)
    private messageReadStatusRepository: Repository<MessageReadStatus>,
  ) {}

  /**
   * Get or create conversation between two users
   * Ensures bidirectional conversation (1-to-1)
   */
  async getOrCreateConversation(
    senderId: number,
    receiverId: number,
    subject?: string,
  ): Promise<Conversation> {
    if (senderId === receiverId) {
      throw new BadRequestException('Cannot create conversation with self');
    }

    // Check existing conversation (bidirectional)
    let conversation = await this.conversationRepository.findOne({
      where: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
      relations: ['sender', 'receiver'],
    });

    if (!conversation) {
      // Create new conversation
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
        throw new NotFoundException('Failed to create conversation');
      }

      conversation = savedConversation;
    }

    return conversation;
  }

  /**
   * Get all conversations for a user (sent and received)
   * Returns active conversations with last message info
   */
  async getUserConversations(
    userId: number,
    skip: number = 0,
    take: number = 20,
  ) {
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

    // Get last message for each conversation
    const conversationsWithMessages = await Promise.all(
      conversations.map(async (conv) => {
        const lastMessage = await this.messageRepository.findOne({
          where: { conversationId: conv.id, isDeleted: false },
          order: { createdAt: 'DESC' },
          relations: ['sender'],
        });

        // Get unread count
        const unreadCount = await this.messageRepository.count({
          where: {
            conversationId: conv.id,
            receiverId: userId,
            isDeleted: false,
          },
        });

        // Check if unread messages exist
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
      }),
    );

    return conversationsWithMessages;
  }

  /**
   * Get specific conversation with messages
   */
  async getConversation(conversationId: number, userId: number, limit: number = 50) {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['sender', 'receiver'],
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Verify user is part of conversation
    const isParticipant =
      conversation.senderId === userId || conversation.receiverId === userId;
    if (!isParticipant) {
      throw new ForbiddenException('You are not part of this conversation');
    }

    // Get messages
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

  /**
   * Create and save a new message
   */
  async sendMessage(
    senderId: number,
    dto: CreateMessageDto,
  ): Promise<Message> {
    const { conversationId, receiverId, content, messageType, fileUrl, fileName, fileSize } = dto;

    // Verify conversation exists and user is participant
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const isParticipant =
      (conversation.senderId === senderId && conversation.receiverId === receiverId) ||
      (conversation.receiverId === senderId && conversation.senderId === receiverId);

    if (!isParticipant) {
      throw new ForbiddenException('You are not part of this conversation');
    }

    // Create message
    const message = this.messageRepository.create({
      conversationId,
      senderId,
      receiverId,
      content,
      messageType,
      ...(fileUrl && { fileUrl }),
      ...(fileName && { fileName }),
      ...(fileSize && { fileSize }),
    });

    await this.messageRepository.save(message);

    // Create read status record
    const readStatus = this.messageReadStatusRepository.create({
      messageId: message.id,
      userId: receiverId,
      isDelivered: true,
      isRead: false,
    });
    await this.messageReadStatusRepository.save(readStatus);

    // Update conversation last message time
    await this.conversationRepository.update(
      { id: conversationId },
      { lastMessageId: message.id, lastMessageAt: new Date() },
    );

    const savedMessage = await this.messageRepository.findOne({
      where: { id: message.id },
      relations: ['sender', 'receiver', 'readStatuses'],
    });

    if (!savedMessage) {
      throw new NotFoundException('Failed to retrieve saved message');
    }

    return savedMessage;
  }

  /**
   * Edit message (only sender can edit)
   */
  async updateMessage(
    messageId: number,
    senderId: number,
    dto: UpdateMessageDto,
  ): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== senderId) {
      throw new ForbiddenException('You can only edit your own messages');
    }

    if (message.isDeleted) {
      throw new BadRequestException('Cannot edit deleted message');
    }

    await this.messageRepository.update(
      { id: messageId },
      {
        content: dto.content || message.content,
        isEdited: true,
        editedAt: new Date(),
      },
    );

    const updatedMessage = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['sender', 'receiver', 'readStatuses'],
    });

    if (!updatedMessage) {
      throw new NotFoundException('Failed to retrieve updated message');
    }

    return updatedMessage;
  }

  /**
   * Soft delete message (only sender can delete)
   */
  async deleteMessage(messageId: number, senderId: number): Promise<void> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== senderId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    await this.messageRepository.update(
      { id: messageId },
      {
        isDeleted: true,
        deletedAt: new Date(),
        content: '[Message deleted]',
      },
    );
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId: number, userId: number): Promise<MessageReadStatus> {
    let readStatus = await this.messageReadStatusRepository.findOne({
      where: { messageId, userId },
    });

    if (!readStatus) {
      throw new NotFoundException('Read status not found');
    }

    if (readStatus.isRead) {
      return readStatus;
    }

    await this.messageReadStatusRepository.update(
      { id: readStatus.id },
      {
        isRead: true,
        readAt: new Date(),
      },
    );

    const updatedReadStatus = await this.messageReadStatusRepository.findOne({
      where: { id: readStatus.id },
    });

    if (!updatedReadStatus) {
      throw new NotFoundException('Failed to retrieve updated read status');
    }

    return updatedReadStatus;
  }

  /**
   * Mark all messages in conversation as read
   */
  async markConversationAsRead(conversationId: number, userId: number): Promise<void> {
    // Get all unread messages in conversation for this user
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

  /**
   * Get unread message count for user
   */
  async getUnreadCount(userId: number): Promise<number> {
    return await this.messageReadStatusRepository.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  /**
   * Get unread messages grouped by conversation
   */
  async getUnreadByConversation(userId: number) {
    const unreadGroups = await this.messageReadStatusRepository
      .createQueryBuilder('mrs')
      .leftJoinAndSelect(
        Message,
        'm',
        'm.id = mrs.messageId',
      )
      .where('mrs.userId = :userId', { userId })
      .andWhere('mrs.isRead = :isRead', { isRead: false })
      .groupBy('m.conversationId')
      .addSelect('m.conversationId', 'conversationId')
      .addSelect('COUNT(*)', 'count')
      .getRawMany();

    return unreadGroups;
  }

  /**
   * Search messages in conversation
   */
  async searchMessages(
    conversationId: number,
    userId: number,
    query: string,
    limit: number = 20,
  ) {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const isParticipant =
      conversation.senderId === userId || conversation.receiverId === userId;
    if (!isParticipant) {
      throw new ForbiddenException('You are not part of this conversation');
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

  /**
   * Delete entire conversation (soft delete)
   */
  async deleteConversation(conversationId: number, userId: number): Promise<void> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const isParticipant =
      conversation.senderId === userId || conversation.receiverId === userId;
    if (!isParticipant) {
      throw new ForbiddenException('You are not part of this conversation');
    }

    // Mark conversation as inactive
    await this.conversationRepository.update(
      { id: conversationId },
      { isActive: false },
    );
  }
}
