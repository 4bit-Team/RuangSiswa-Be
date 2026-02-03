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
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CallService } from './call.service';
import { CreateCallDto, CallOfferDto, CallAnswerDto, CallRejectDto, CallEndDto, IceCandidateDto } from './dto/call.dto';
import { RateLimiter, IceCandidateSpamDetector } from './rate-limiter';

interface AuthenticatedSocket extends Socket {
  userId: number;
}

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://ruangsiswa.my.id',
  'http://ruangsiswa.my.id',
];

/**
 * Call Gateway - Handles all WebRTC call signaling
 * Separate from ChatGateway for better performance and maintainability
 */
@WebSocketGateway({
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  namespace: '/call',
  pingInterval: 25000,
  pingTimeout: 5000,
})
@Injectable()
export class CallGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // Track online users: Map<userId, socketId>
  private onlineUsers = new Map<number, string>();

  // Rate limiters untuk call events
  private callLimiter: RateLimiter;
  private iceLimiter: RateLimiter;
  private spamDetector: IceCandidateSpamDetector;

  constructor(
    private jwtService: JwtService,
    private callService: CallService,
  ) {
    // Initialize rate limiters
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
   * Get JWT secret from environment
   */
  private getJwtSecret(): string {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    if (!secret || secret === 'your-secret-key') {
      console.warn('[Call] ⚠️ WARNING: Using default JWT secret. Set JWT_SECRET environment variable!');
    }
    return secret;
  }

  /**
   * Lifecycle hook - called when gateway is initialized
   */
  afterInit() {
    console.log('[WebSocket] Call gateway initialized');
    
    // Set up global error handlers
    this.server.on('error', (error) => {
      console.error('[Call] Server error:', error);
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
        console.error('[Call] No token provided');
        client.disconnect();
        return;
      }

      // Verify JWT token with secret
      let payload: any;
      try {
        payload = this.jwtService.verify(token, {
          secret: this.getJwtSecret(),
        });
        console.log('[Call] JWT Payload:', payload);
      } catch (jwtError: any) {
        console.error('[Call] JWT verification error:', jwtError.message);
        client.disconnect();
        return;
      }
      
      client.userId = payload.id || payload.sub || payload.userId;
      
      if (!client.userId) {
        console.error('[Call] No userId found in JWT payload:', payload);
        client.disconnect();
        return;
      }

      // Track user as online
      this.onlineUsers.set(client.userId, client.id);

      console.log(
        `[Call] User ${client.userId} connected with socket ${client.id}`,
      );
    } catch (error) {
      console.error('[Call] Authentication failed:', error instanceof Error ? error.message : String(error));
      client.disconnect();
    }
  }

  /**
   * Handle client disconnection
   */
  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.onlineUsers.delete(client.userId);
      console.log(`[Call] User ${client.userId} disconnected from /call namespace`);
    } else {
      console.warn(`[Call] Unknown user disconnected`);
    }
  }

  /**
   * Handle connection errors
   */
  handleError(client: AuthenticatedSocket, error: any) {
    console.error(`[Call] Connection error for user ${client.userId}:`, error);
  }

  /**
   * Initiate a call (audio or video)
   * ✅ CRITICAL: Include offer in initial message
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
          `🚫 [Call] Blocked user ${client.userId} attempted call`,
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
          `⚠️ [Call] Call rate limit exceeded for user ${client.userId}`,
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

      console.log(`[Call] Call initiated: ${client.userId} → ${data.receiverId}, callId: ${call.id}`);

      // ✅ CRITICAL: Send offer immediately with call-incoming event
      this.notifyUser(data.receiverId, 'call-incoming', {
        callId: call.id,
        callType: call.callType,
        callerId: client.userId,
        callerName: 'Caller',
        offer: data.offer, // ✅ Include offer immediately
        timestamp: new Date(),
      });

      return {
        status: 'initiated',
        callId: call.id,
      };
    } catch (error) {
      console.error('[Call] Error initiating call:', error.message);
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
        `[Call] Call offer sent: ${client.userId} → ${call.receiverId}`,
      );

      return { status: 'offer-sent' };
    } catch (error) {
      console.error('[Call] Error sending offer:', error.message);
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

      // ✅ CRITICAL: Check if answer already sent to prevent duplicate
      if (call.receiverAnswer && call.receiverAnswer !== data.answer) {
        console.warn(`[Call] ⚠️ Answer already processed for call ${data.callId}, ignoring duplicate`);
        return { status: 'accepted' };
      }

      // Send answer back to caller
      this.notifyUser(call.callerId, 'call-answer', {
        callId: data.callId,
        answer: data.answer,
        iceCandidates: data.iceCandidates ? JSON.parse(data.iceCandidates) : [],
        timestamp: new Date(),
      });

      console.log(
        `[Call] Call accepted: ${client.userId} accepting from ${call.callerId}`,
      );

      return { status: 'accepted' };
    } catch (error) {
      console.error('[Call] Error accepting call:', error.message);
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
        `[Call] Call rejected: ${client.userId} rejecting from ${call.callerId}`,
      );

      return { status: 'rejected' };
    } catch (error) {
      console.error('[Call] Error rejecting call:', error.message);
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
        `[Call] Call ended: ${client.userId} (duration: ${call.duration}s)`,
      );

      return {
        status: 'ended',
        duration: call.duration,
      };
    } catch (error) {
      console.error('[Call] Error ending call:', error.message);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Exchange ICE candidates (for NAT traversal)
   * ✅ CRITICAL: Rate limited to prevent DDoS
   * ✅ IMPROVED: Detailed logging for verification
   */
  @SubscribeMessage('ice-candidate')
  async handleIceCandidate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: IceCandidateDto,
  ) {
    try {
      // Determine candidate type for logging
      const candidateType = data.candidate?.includes('typ host') ? '🏠 HOST' : 
                           data.candidate?.includes('typ srflx') ? '🔀 SRFLX' : 
                           data.candidate?.includes('typ relay') ? '🔁 RELAY' : '❓ UNKNOWN';
      
      console.log(`📥 [Call] ICE candidate received from user ${client.userId} (${candidateType}):`, {
        callId: data.callId,
        candidateHash: data.candidate?.substring(0, 50) || 'NONE',
        sdpMLineIndex: data.sdpMLineIndex,
        sdpMid: data.sdpMid,
      });
      
      // Check if user is blocked
      const userBlock = this.iceLimiter.isBlocked(client.userId);
      if (userBlock.blocked) {
        console.warn(
          `🚫 [Call] Blocked user ${client.userId} attempted ICE candidate spam`,
        );
        return {
          status: 'error',
          message: `You are temporarily blocked: ${userBlock.reason}`,
        };
      }

      // Validate ICE candidate format
      if (!data.candidate) {
        console.warn(
          `⚠️ [Call] Invalid ICE candidate from user ${client.userId}: missing candidate string`,
        );
        return {
          status: 'error',
          message: 'Invalid ICE candidate: missing candidate string',
        };
      }

      // CallId should be present
      if (!data.callId) {
        console.warn(
          `⚠️ [Call] ICE candidate from user ${client.userId} has NO callId - candidate will be DROPPED. Check frontend for ICE callId tracking issue.`,
        );
        return {
          status: 'error',
          message: 'ICE candidate rejected: callId is required. Please ensure call is properly initiated.',
        };
      }

      // Check for spam/DDoS patterns
      const spamCheck = this.spamDetector.checkSpam(client.userId, data.callId);
      if (spamCheck.spam) {
        const reason = spamCheck.reason || 'ICE candidate spam detected';
        console.warn(`🚨 [Call] ICE spam detected from user ${client.userId}: ${reason}`);
        
        // Block user for 30 minutes
        this.iceLimiter.blockUser(client.userId, 1800000, reason);
        
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
        console.warn(`⚠️ [Call] ICE rate limit exceeded for user ${client.userId}`);
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

      console.log(`📤 [Call] Forwarding ICE candidate to user ${otherUserId}:`, {
        fromUser: client.userId,
        toUser: otherUserId,
        candidateType: candidateType,
        callId: data.callId,
        callState: call.status,
      });

      // Check if recipient is online
      const recipientSocketId = this.onlineUsers.get(otherUserId);
      if (!recipientSocketId) {
        console.warn(`⚠️ [Call] Recipient user ${otherUserId} is not online, cannot forward ICE candidate`);
        return {
          status: 'warning',
          message: 'Recipient is not online, candidate queued for later delivery',
        };
      }

      // Send to recipient
      this.server.to(recipientSocketId).emit('ice-candidate', {
        callId: data.callId,
        candidate: data.candidate,
        sdpMLineIndex: data.sdpMLineIndex,
        sdpMid: data.sdpMid,
        timestamp: new Date(),
      });

      console.log(`✅ [Call] ICE candidate successfully forwarded to user ${otherUserId}`);

      return { status: 'ice-candidate-sent' };
    } catch (error) {
      console.error('[Call] Error sending ICE candidate:', error.message);
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
      console.error('[Call] Error getting call history:', error.message);
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
      console.error('[Call] Error getting call stats:', error.message);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Helper method to emit event to specific user
   */
  private notifyUser(userId: number, event: string, data: any) {
    // Find socket for this user
    const socketId = this.onlineUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, data);
      console.log(`[Call] Event '${event}' sent to user ${userId}`);
    } else {
      console.warn(`[Call] User ${userId} is not online, cannot send '${event}'`);
    }
  }

  /**
   * ✅ DEBUG ENDPOINT: Unblock user from rate limiting
   * Usage: socket.emit('debug:unblock-user', { userId }, (response) => { ... })
   */
  @SubscribeMessage('debug:unblock-user')
  handleUnblockUser(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { userId: number },
  ) {
    try {
      // Unblock from ICE rate limiter
      const unblockedIce = this.iceLimiter.unblockUser(data.userId);
      
      // Unblock from ICE spam detector
      const unblockedSpam = this.spamDetector.unblockUser(data.userId);
      
      // Unblock from general call rate limiter
      const unblockedCall = this.callLimiter.unblockUser(data.userId);

      console.log(
        `🔓 [Call] Debug unblock requested by user ${client.userId} for user ${data.userId}`,
        { unblockedIce, unblockedSpam, unblockedCall },
      );

      return {
        status: 'success',
        message: `User ${data.userId} unblocked`,
        unblocked: {
          ice: unblockedIce,
          spam: unblockedSpam,
          call: unblockedCall,
        },
      };
    } catch (error) {
      console.error('[Call] Error unblocking user:', error.message);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Get list of blocked users (for admin API)
   */
  getBlockedUsers() {
    return this.callLimiter.getBlockedUsers();
  }

  /**
   * Get list of suspicious users (for admin API)
   */
  getSuspiciousUsers() {
    return this.spamDetector.getSuspiciousUsers();
  }

  /**
   * Unblock user via admin API
   * Handles BOTH blocked users (from callLimiter) and suspicious users (from spamDetector)
   */
  unblockUserAdmin(userId: number | string): boolean {
    const userIdNum = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    console.log(`[CallGateway] 🔓 unblockUserAdmin called for user ${userIdNum}`);
    
    const unblockedCall = this.callLimiter.unblockUser(userIdNum);
    console.log(`[CallGateway] - callLimiter.unblockUser (BLOCKED list): ${unblockedCall}`);
    
    const unblockedSpam = this.spamDetector.unblockUser(userIdNum);
    console.log(`[CallGateway] - spamDetector.unblockUser (SUSPICIOUS list): ${unblockedSpam}`);
    
    const result = unblockedCall || unblockedSpam;
    console.log(`[CallGateway] - Final result (either list unblocked): ${result}`);
    console.log(`[CallGateway] ✅ User ${userIdNum} handled. Unblocked from ${unblockedCall ? 'BLOCKED' : ''} ${unblockedSpam ? 'SUSPICIOUS' : ''} ${!result ? 'NEITHER (already unblocked)' : ''}`);
    
    return result;
  }
}
