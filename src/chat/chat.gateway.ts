import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { CallService } from './call.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { RateLimiter } from './rate-limiter';

interface AuthenticatedSocket extends Socket {
  userId: number;
}

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://ruangsiswa.my.id',
  'http://ruangsiswa.my.id',
];

@WebSocketGateway({
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  namespace: '/chat',
  pingInterval: 25000,
  pingTimeout: 5000,
})
@Injectable()
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // Track online users: Map<userId, socketId>
  private onlineUsers = new Map<number, string>();

  // Rate limiters untuk berbagai events
  private messageLimiter: RateLimiter;

  constructor(
    private jwtService: JwtService,
    private chatService: ChatService,
  ) {
    // Initialize rate limiters
    // 50 messages per 60 seconds
    this.messageLimiter = new RateLimiter({
      windowMs: 60000,
      maxRequests: 50,
      message: 'Too many messages sent. Please try again later.',
    });
  }

  /**
   * Get JWT secret from environment
   */
  private getJwtSecret(): string {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    if (!secret || secret === 'your-secret-key') {
      console.warn('[WebSocket] ⚠️ WARNING: Using default JWT secret. Set JWT_SECRET environment variable!');
    }
    return secret;
  }

  /**
   * Lifecycle hook - called when gateway is initialized
   */
  afterInit() {
    console.log('[WebSocket] Chat gateway initialized');
    
    // Set up global error handlers
    this.server.on('error', (error) => {
      console.error('[Chat] Server error:', error);
    });
  }

  /**
   * Handle client connection
   * Authenticate user via JWT token
   */
  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        console.error('[WebSocket] No token provided');
        client.disconnect();
        return;
      }

      // Verify JWT token with secret
      let payload: any;
      try {
        payload = this.jwtService.verify(token, {
          secret: this.getJwtSecret(),
        });
        console.log('[WebSocket] JWT Payload:', payload);
      } catch (jwtError: any) {
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

      // Track user as online
      this.onlineUsers.set(client.userId, client.id);

      // Notify all clients about user coming online
      this.server.emit('user-online', {
        userId: client.userId,
        socketId: client.id,
        timestamp: new Date(),
      });

      console.log(
        `[WebSocket] User ${client.userId} connected with socket ${client.id}`,
      );

      // Join user to personal room (for direct messaging)
      client.join(`user-${client.userId}`);
    } catch (error) {
      console.error('[WebSocket] Authentication failed:', error instanceof Error ? error.message : String(error));
      client.disconnect();
    }
  }

  /**
   * Handle client disconnection
   */
  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.onlineUsers.delete(client.userId);

      // Notify all clients about user going offline
      this.server.emit('user-offline', {
        userId: client.userId,
        timestamp: new Date(),
      });

      console.log(`[WebSocket] User ${client.userId} disconnected from /chat namespace`);
    } else {
      console.warn(`[WebSocket] Unknown user disconnected`);
    }
  }

  /**
   * Handle connection errors
   */
  handleError(client: AuthenticatedSocket, error: any) {
    console.error(`[WebSocket] Connection error for user ${client.userId}:`, error);
  }

  /**
   * Subscribe to conversation real-time updates
   * Client joins a conversation room
   */
  @SubscribeMessage('join-conversation')
  handleJoinConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: number },
  ) {
    const roomName = `conversation-${data.conversationId}`;
    client.join(roomName);

    console.log(
      `[WebSocket] User ${client.userId} joined conversation ${data.conversationId}`,
    );

    // Notify others in the room
    this.server.to(roomName).emit('user-joined', {
      userId: client.userId,
      conversationId: data.conversationId,
      timestamp: new Date(),
    });

    return { status: 'joined', conversationId: data.conversationId };
  }

  /**
   * Leave conversation room
   */
  @SubscribeMessage('leave-conversation')
  handleLeaveConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: number },
  ) {
    const roomName = `conversation-${data.conversationId}`;
    client.leave(roomName);

    console.log(
      `[WebSocket] User ${client.userId} left conversation ${data.conversationId}`,
    );

    // Notify others in the room
    this.server.to(roomName).emit('user-left', {
      userId: client.userId,
      conversationId: data.conversationId,
      timestamp: new Date(),
    });

    return { status: 'left', conversationId: data.conversationId };
  }

  /**
   * Send message via WebSocket
   * Saves to database and broadcasts to recipients
   */
  @SubscribeMessage('send-message')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: CreateMessageDto,
  ) {
    try {
      // Check if user is blocked
      const userBlock = this.messageLimiter.isBlocked(client.userId);
      if (userBlock.blocked) {
        console.warn(
          `🚫 [ChatGateway] Blocked user ${client.userId} attempted message`,
        );
        return {
          status: 'error',
          message: `You are temporarily blocked: ${userBlock.reason}`,
        };
      }

      // Rate limit check
      const rateCheck = this.messageLimiter.check(`msg:${client.userId}`);
      if (!rateCheck.allowed) {
        console.warn(
          `⚠️ [ChatGateway] Rate limit exceeded for user ${client.userId}`,
        );
        // Block user for 5 minutes after exceeding limit
        this.messageLimiter.blockUser(
          client.userId,
          300000,
          'Message rate limit exceeded',
        );
        return {
          status: 'error',
          message: rateCheck.message,
        };
      }

      const message = await this.chatService.sendMessage(client.userId, data);

      const conversationRoom = `conversation-${data.conversationId}`;

      // Broadcast message to conversation room
      this.server.to(conversationRoom).emit('message-received', {
        message,
        conversationId: data.conversationId,
        timestamp: new Date(),
      });

      // Also send direct notification to receiver's personal room
      this.server.to(`user-${data.receiverId}`).emit('new-message', {
        message,
        conversationId: data.conversationId,
        senderId: client.userId,
        timestamp: new Date(),
      });

      console.log(
        `[WebSocket] Message sent from ${client.userId} to ${data.receiverId} in conversation ${data.conversationId}`,
      );

      return {
        status: 'sent',
        message,
      };
    } catch (error) {
      console.error('[WebSocket] Error sending message:', error.message);
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  /**
   * Type indicator (show when user is typing)
   */
  @SubscribeMessage('user-typing')
  handleUserTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: number },
  ) {
    const roomName = `conversation-${data.conversationId}`;

    this.server.to(roomName).emit('user-typing', {
      userId: client.userId,
      conversationId: data.conversationId,
      timestamp: new Date(),
    });

    return { status: 'typing' };
  }

  /**
   * Stop typing indicator
   */
  @SubscribeMessage('user-stopped-typing')
  handleUserStoppedTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: number },
  ) {
    const roomName = `conversation-${data.conversationId}`;

    this.server.to(roomName).emit('user-stopped-typing', {
      userId: client.userId,
      conversationId: data.conversationId,
      timestamp: new Date(),
    });

    return { status: 'stopped-typing' };
  }

  /**
   * Mark message as read
   */
  @SubscribeMessage('mark-as-read')
  async handleMarkAsRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { messageId: number; conversationId: number },
  ) {
    try {
      const readStatus = await this.chatService.markAsRead(
        data.messageId,
        client.userId,
      );

      const roomName = `conversation-${data.conversationId}`;

      // Broadcast read receipt
      this.server.to(roomName).emit('message-read', {
        messageId: data.messageId,
        userId: client.userId,
        conversationId: data.conversationId,
        readAt: readStatus.readAt,
        timestamp: new Date(),
      });

      return { status: 'marked-as-read' };
    } catch (error) {
      console.error('[WebSocket] Error marking as read:', error.message);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Mark all messages in conversation as read
   */
  @SubscribeMessage('mark-conversation-read')
  async handleMarkConversationAsRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: number },
  ) {
    try {
      await this.chatService.markConversationAsRead(
        data.conversationId,
        client.userId,
      );

      const roomName = `conversation-${data.conversationId}`;

      this.server.to(roomName).emit('conversation-read', {
        userId: client.userId,
        conversationId: data.conversationId,
        timestamp: new Date(),
      });

      return { status: 'conversation-marked-as-read' };
    } catch (error) {
      console.error(
        '[WebSocket] Error marking conversation as read:',
        error.message,
      );
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Delete message
   */
  @SubscribeMessage('delete-message')
  async handleDeleteMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { messageId: number; conversationId: number },
  ) {
    try {
      await this.chatService.deleteMessage(data.messageId, client.userId);

      const roomName = `conversation-${data.conversationId}`;

      // Broadcast deletion
      this.server.to(roomName).emit('message-deleted', {
        messageId: data.messageId,
        conversationId: data.conversationId,
        timestamp: new Date(),
      });

      return { status: 'deleted' };
    } catch (error) {
      console.error('[WebSocket] Error deleting message:', error.message);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Request online users in a conversation
   */
  @SubscribeMessage('get-online-users')
  handleGetOnlineUsers(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: number },
  ) {
    const onlineUserIds = Array.from(this.onlineUsers.keys());
    return {
      conversationId: data.conversationId,
      onlineUsers: onlineUserIds,
      timestamp: new Date(),
    };
  }

  /**
   * Get user online status
   */
  @SubscribeMessage('get-user-status')
  handleGetUserStatus(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { userId: number },
  ) {
    const isOnline = this.onlineUsers.has(data.userId);
    return {
      userId: data.userId,
      isOnline,
      timestamp: new Date(),
    };
  }

  /**
   * Helper method to emit event to specific user room
   */
  notifyUser(userId: number, event: string, data: any) {
    this.server.to(`user-${userId}`).emit(event, data);
  }

  /**
   * Helper method to emit event to conversation room
   */
  notifyConversation(conversationId: number, event: string, data: any) {
    this.server.to(`conversation-${conversationId}`).emit(event, data);
  }

  /**
   * Get online users count
   */
  getOnlineUsersCount(): number {
    return this.onlineUsers.size;
  }

  /**
   * Check if user is online
   */
  isUserOnline(userId: number): boolean {
    return this.onlineUsers.has(userId);
  }
}
