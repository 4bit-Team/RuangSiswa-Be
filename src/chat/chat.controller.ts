import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { CreateMessageDto } from './dto/create-message.dto';
import { ConversationDto } from './dto/conversation.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatGateway: ChatGateway,
  ) {}

  /**
   * GET /chat/conversations
   * Get all conversations for authenticated user
   */
  @Get('conversations')
  async getUserConversations(
    @Request() req,
    @Query('skip', new ParseIntPipe({ optional: true })) skip: number = 0,
    @Query('take', new ParseIntPipe({ optional: true })) take: number = 20,
  ) {
    return await this.chatService.getUserConversations(req.user.id, skip, take);
  }

  /**
   * POST /chat/conversations
   * Create or get existing conversation with a user
   */
  @Post('conversations')
  async createConversation(
    @Request() req,
    @Body() dto: ConversationDto,
  ) {
    return await this.chatService.getOrCreateConversation(
      req.user.id,
      dto.receiverId,
      dto.subject,
    );
  }

  /**
   * GET /chat/conversations/:id
   * Get specific conversation with messages
   */
  @Get('conversations/:id')
  async getConversation(
    @Request() req,
    @Param('id', ParseIntPipe) conversationId: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 50,
  ) {
    return await this.chatService.getConversation(
      conversationId,
      req.user.id,
      limit,
    );
  }

  /**
   * DELETE /chat/conversations/:id
   * Soft delete conversation (mark as inactive)
   */
  @Delete('conversations/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteConversation(
    @Request() req,
    @Param('id', ParseIntPipe) conversationId: number,
  ) {
    await this.chatService.deleteConversation(conversationId, req.user.id);
  }

  /**
   * POST /chat/messages
   * Send new message
   */
  @Post('messages')
  async sendMessage(
    @Request() req,
    @Body() dto: CreateMessageDto,
  ) {
    const message = await this.chatService.sendMessage(req.user.id, dto);
    
    // Broadcast message via WebSocket to conversation room
    this.chatGateway.notifyConversation(
      dto.conversationId,
      'message-received',
      {
        message,
        conversationId: dto.conversationId,
        timestamp: new Date(),
      }
    );
    
    // Also send direct notification to receiver's personal room
    this.chatGateway.notifyUser(
      dto.receiverId,
      'new-message',
      {
        message,
        conversationId: dto.conversationId,
        senderId: req.user.id,
        timestamp: new Date(),
      }
    );
    
    return message;
  }

  /**
   * PUT /chat/messages/:id
   * Edit message (only sender can edit)
   */
  @Put('messages/:id')
  async updateMessage(
    @Request() req,
    @Param('id', ParseIntPipe) messageId: number,
    @Body() dto: UpdateMessageDto,
  ) {
    return await this.chatService.updateMessage(messageId, req.user.id, dto);
  }

  /**
   * DELETE /chat/messages/:id
   * Delete message (only sender can delete)
   */
  @Delete('messages/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMessage(
    @Request() req,
    @Param('id', ParseIntPipe) messageId: number,
  ) {
    await this.chatService.deleteMessage(messageId, req.user.id);
  }

  /**
   * PUT /chat/messages/:id/read
   * Mark message as read
   */
  @Put('messages/:id/read')
  async markAsRead(
    @Request() req,
    @Param('id', ParseIntPipe) messageId: number,
  ) {
    return await this.chatService.markAsRead(messageId, req.user.id);
  }

  /**
   * PUT /chat/conversations/:id/mark-read
   * Mark all messages in conversation as read
   */
  @Put('conversations/:id/mark-read')
  @HttpCode(HttpStatus.OK)
  async markConversationAsRead(
    @Request() req,
    @Param('id', ParseIntPipe) conversationId: number,
  ) {
    await this.chatService.markConversationAsRead(conversationId, req.user.id);
    return { message: 'Conversation marked as read' };
  }

  /**
   * GET /chat/unread-count
   * Get total unread message count for user
   */
  @Get('unread-count')
  async getUnreadCount(@Request() req) {
    const count = await this.chatService.getUnreadCount(req.user.id);
    return { unreadCount: count };
  }

  /**
   * GET /chat/unread-by-conversation
   * Get unread count grouped by conversation
   */
  @Get('unread-by-conversation')
  async getUnreadByConversation(@Request() req) {
    return await this.chatService.getUnreadByConversation(req.user.id);
  }

  /**
   * GET /chat/count
   * Get total message count
   */
  @Get('count')
  async getMessageCount() {
    const count = await this.chatService.getMessageCount();
    return { count };
  }

  /**
   * GET /chat/search
   * Search messages in a conversation
   */
  @Get('search')
  async searchMessages(
    @Request() req,
    @Query('conversationId', ParseIntPipe) conversationId: number,
    @Query('query') query: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  ) {
    return await this.chatService.searchMessages(
      conversationId,
      req.user.id,
      query,
      limit,
    );
  }

  /**
   * POST /chat/messages/send-voice
   * Send voice message with audio file
   */
  @Post('messages/send-voice')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
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
          cb(new BadRequestException('Only audio files are allowed!'), false);
        } else {
          cb(null, true);
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async sendVoiceMessage(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    if (!file) {
      throw new BadRequestException('No audio file uploaded');
    }

    const conversationId = parseInt(body.conversationId);
    const duration = parseInt(body.duration) || 0;
    const messageType = body.messageType || 'voice';

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const voiceUrl = `${backendUrl}/uploads/voices/${file.filename}`;

    // Create voice message through service
    const message = await this.chatService.sendVoiceMessage(
      req.user.id,
      conversationId,
      voiceUrl,
      file.filename,
      file.size,
      duration,
    );

    // Broadcast message via WebSocket
    this.chatGateway.notifyConversation(
      conversationId,
      'message-received',
      {
        message,
        conversationId,
        timestamp: new Date(),
      }
    );

    // Send notification to receiver
    this.chatGateway.notifyUser(
      message.receiverId,
      'new-message',
      {
        message,
        conversationId,
        senderId: req.user.id,
        timestamp: new Date(),
      }
    );

    return message;
  }
}
