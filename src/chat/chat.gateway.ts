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
import { CreateCallDto, CallOfferDto, CallAnswerDto, CallRejectDto, CallEndDto, IceCandidateDto } from './dto/call.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RateLimiter, IceCandidateSpamDetector } from './rate-limiter';

interface AuthenticatedSocket extends Socket {
  userId: number;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  namespace: '/chat',
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
  private callLimiter: RateLimiter;
  private iceLimiter: RateLimiter;
  private spamDetector: IceCandidateSpamDetector;

  constructor(
    private jwtService: JwtService,
    private chatService: ChatService,
    private callService: CallService,
  ) {
    // Initialize rate limiters
    // 50 messages per 60 seconds
    this.messageLimiter = new RateLimiter({
      windowMs: 60000,
      maxRequests: 50,
      message: 'Too many messages sent. Please try again later.',
    });

    // 20 call attempts per 60 seconds
    this.callLimiter = new RateLimiter({
      windowMs: 60000,
      maxRequests: 20,
      message: 'Too many call attempts. Please try again later.',
    });

    // 100 ICE candidates per 60 seconds
    this.iceLimiter = new RateLimiter({
      windowMs: 60000,
      maxRequests: 100,
      message: 'Too many ICE candidates. Possible DDoS attempt.',
    });

    // ICE candidate spam detector
    this.spamDetector = new IceCandidateSpamDetector();
  }

  /**
   * Lifecycle hook - called when gateway is initialized
   */
  afterInit() {
    console.log('[WebSocket] Chat gateway initialized');
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

      // Verify JWT token
      const payload = this.jwtService.verify(token);
      console.log('[WebSocket] JWT Payload:', payload);
      
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
      console.error('[WebSocket] Authentication failed:', error.message);
      client.disconnect();
    }
  }

  /**
   * Handle client disconnection
   */
  handleDisconnect(client: AuthenticatedSocket) {
    this.onlineUsers.delete(client.userId);

    // Notify all clients about user going offline
    this.server.emit('user-offline', {
      userId: client.userId,
      timestamp: new Date(),
    });

    console.log(`[WebSocket] User ${client.userId} disconnected`);
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

  // ==================== CALL EVENTS ====================

  /**
   * Initiate a call (audio or video)
   */
  @SubscribeMessage('call-initiate')
  async handleCallInitiate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: CreateCallDto,
  ) {
    try {
      if (!client.userId) {
        throw new Error('User not authenticated or userId is missing');
      }

      // Check if user is blocked
      const userBlock = this.callLimiter.isBlocked(client.userId);
      if (userBlock.blocked) {
        console.warn(
          `🚫 [ChatGateway] Blocked user ${client.userId} attempted call`,
        );
        return {
          status: 'error',
          message: `You are temporarily blocked from making calls: ${userBlock.reason}`,
        };
      }

      // Rate limit check
      const rateCheck = this.callLimiter.check(`call:${client.userId}`);
      if (!rateCheck.allowed) {
        console.warn(
          `⚠️ [ChatGateway] Call rate limit exceeded for user ${client.userId}`,
        );
        // Block user for 10 minutes after exceeding limit
        this.callLimiter.blockUser(
          client.userId,
          600000,
          'Call rate limit exceeded',
        );
        return {
          status: 'error',
          message: rateCheck.message,
        };
      }

      const call = await this.callService.initiateCall(client.userId, data);

      // Notify receiver about incoming call WITH OFFER
      this.notifyUser(data.receiverId, 'call-incoming', {
        callId: call.id,
        callType: call.callType,
        callerId: client.userId,
        callerName: 'Caller',
        offer: data.offer, // ✅ Include offer immediately
        timestamp: new Date(),
      });

      console.log(
        `[WebSocket] Call initiated: ${client.userId} → ${data.receiverId}`,
      );

      return {
        status: 'initiated',
        callId: call.id,
      };
    } catch (error) {
      console.error('[WebSocket] Error initiating call:', error.message);
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  /**
   * Send SDP offer dari caller
   */
  @SubscribeMessage('call-offer')
  async handleCallOffer(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: CallOfferDto,
  ) {
    try {
      const call = await this.callService.saveCallerOffer(
        client.userId,
        data.callId,
        data.offer,
      );

      // Send offer to receiver
      this.notifyUser(call.receiverId, 'call-offer', {
        callId: data.callId,
        offer: data.offer,
        iceCandidates: data.iceCandidates ? JSON.parse(data.iceCandidates) : [],
        timestamp: new Date(),
      });

      console.log(
        `[WebSocket] Call offer sent: ${client.userId} → ${call.receiverId}`,
      );

      return { status: 'offer-sent' };
    } catch (error) {
      console.error('[WebSocket] Error sending offer:', error.message);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Receiver menerima call dan mengirim answer
   */
  @SubscribeMessage('call-accept')
  async handleCallAccept(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: CallAnswerDto,
  ) {
    try {
      const call = await this.callService.acceptCall(
        client.userId,
        data.callId,
        data.answer,
      );

      // Send answer back to caller
      this.notifyUser(call.callerId, 'call-answer', {
        callId: data.callId,
        answer: data.answer,
        iceCandidates: data.iceCandidates ? JSON.parse(data.iceCandidates) : [],
        timestamp: new Date(),
      });

      console.log(
        `[WebSocket] Call accepted: ${client.userId} accepting from ${call.callerId}`,
      );

      return { status: 'accepted' };
    } catch (error) {
      console.error('[WebSocket] Error accepting call:', error.message);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Receiver menolak call
   */
  @SubscribeMessage('call-reject')
  async handleCallReject(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: CallRejectDto,
  ) {
    try {
      const call = await this.callService.rejectCall(
        client.userId,
        data.callId,
        data.reason,
      );

      // Notify caller about rejection
      this.notifyUser(call.callerId, 'call-rejected', {
        callId: data.callId,
        reason: data.reason || 'User declined',
        timestamp: new Date(),
      });

      console.log(
        `[WebSocket] Call rejected: ${client.userId} rejecting from ${call.callerId}`,
      );

      return { status: 'rejected' };
    } catch (error) {
      console.error('[WebSocket] Error rejecting call:', error.message);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * End an active call
   */
  @SubscribeMessage('call-end')
  async handleCallEnd(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: CallEndDto,
  ) {
    try {
      const call = await this.callService.endCall(
        client.userId,
        data.callId,
        data.duration,
      );

      // Notify other party about call end
      const otherUserId =
        call.callerId === client.userId ? call.receiverId : call.callerId;

      this.notifyUser(otherUserId, 'call-ended', {
        callId: data.callId,
        duration: call.duration,
        timestamp: new Date(),
      });

      console.log(
        `[WebSocket] Call ended: ${client.userId} (duration: ${call.duration}s)`,
      );

      return {
        status: 'ended',
        duration: call.duration,
      };
    } catch (error) {
      console.error('[WebSocket] Error ending call:', error.message);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Exchange ICE candidates (for NAT traversal)
   * CRITICAL: Most likely target for DDoS spam
   */
  @SubscribeMessage('ice-candidate')
  async handleIceCandidate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: IceCandidateDto,
  ) {
    try {
      // Check if user is blocked
      const userBlock = this.iceLimiter.isBlocked(client.userId);
      if (userBlock.blocked) {
        console.warn(
          `🚫 [ChatGateway] Blocked user ${client.userId} attempted ICE candidate spam`,
        );
        return {
          status: 'error',
          message: `You are temporarily blocked: ${userBlock.reason}`,
        };
      }

      // Validate ICE candidate format
      if (!data.candidate) {
        console.warn(
          `⚠️ [ChatGateway] Invalid ICE candidate from user ${client.userId}: missing candidate string`,
        );
        return {
          status: 'error',
          message: 'Invalid ICE candidate: missing candidate string',
        };
      }

      // CallId can be null during initial ice gathering, but should have it eventually
      if (!data.callId) {
        console.warn(
          `⚠️ [ChatGateway] ICE candidate from user ${client.userId} has no callId (buffering)`,
        );
        // Don't reject, but don't process either - client should retry with callId
        return {
          status: 'waiting',
          message: 'callId not yet available, candidate not forwarded',
        };
      }

      // Check for spam/DDoS patterns
      const spamCheck = this.spamDetector.checkSpam(client.userId, data.callId);
      if (spamCheck.spam) {
        const reason = spamCheck.reason || 'ICE candidate spam detected';
        console.warn(`🚨 [ChatGateway] ICE spam detected from user ${client.userId}: ${reason}`);
        
        // Block user for 30 minutes
        this.iceLimiter.blockUser(client.userId, 1800000, reason);
        
        // Alert admin (log it)
        console.error(
          `[SECURITY] POTENTIAL DDoS ATTACK - User ${client.userId} blocked for spam: ${reason}`,
        );
        return {
          status: 'error',
          message: 'Possible DDoS attempt detected. You have been temporarily blocked.',
        };
      }

      // Rate limit check
      const rateCheck = this.iceLimiter.check(`ice:${client.userId}`);
      if (!rateCheck.allowed) {
        console.warn(`⚠️ [ChatGateway] ICE rate limit exceeded for user ${client.userId}`);
        this.iceLimiter.blockUser(
          client.userId,
          600000,
          'ICE candidate rate limit exceeded',
        );
        return {
          status: 'error',
          message: rateCheck.message,
        };
      }

      const call = await this.callService.addIceCandidate(client.userId, data);

      // Forward ICE candidate to other party
      const otherUserId =
        call.callerId === client.userId ? call.receiverId : call.callerId;

      // Use candidate as-is (frontend sends the candidate string, not JSON)
      this.notifyUser(otherUserId, 'ice-candidate', {
        callId: data.callId,
        candidate: data.candidate, // Already a string from frontend
        sdpMLineIndex: data.sdpMLineIndex,
        sdpMid: data.sdpMid,
        timestamp: new Date(),
      });

      console.log(`✓ ICE candidate forwarded: ${client.userId} → ${otherUserId} for call ${data.callId}`);
      return { status: 'ice-candidate-sent' };
    } catch (error) {
      console.error('[WebSocket] Error sending ICE candidate:', error.message);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Request call history
   */
  @SubscribeMessage('get-call-history')
  async handleGetCallHistory(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { otherUserId: number },
  ) {
    try {
      const calls = await this.callService.getCallHistory(
        client.userId,
        data.otherUserId,
        20,
      );

      return {
        status: 'success',
        calls,
      };
    } catch (error) {
      console.error('[WebSocket] Error getting call history:', error.message);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Get call statistics
   */
  @SubscribeMessage('get-call-stats')
  async handleGetCallStats(
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      const stats = await this.callService.getCallStats(client.userId);

      return {
        status: 'success',
        stats,
      };
    } catch (error) {
      console.error('[WebSocket] Error getting call stats:', error.message);
      return { status: 'error', message: error.message };
    }
  }
}
