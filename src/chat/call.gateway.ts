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

/**
 * Call Gateway - Handles all WebRTC call signaling
 * Separate from ChatGateway for better performance and maintainability
 */
@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  namespace: '/call',
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
   * Lifecycle hook - called when gateway is initialized
   */
  afterInit() {
    console.log('[WebSocket] Call gateway initialized');
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

      // Verify JWT token
      const payload = this.jwtService.verify(token);
      console.log('[Call] JWT Payload:', payload);
      
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
      console.error('[Call] Authentication failed:', error.message);
      client.disconnect();
    }
  }

  /**
   * Handle client disconnection
   */
  handleDisconnect(client: AuthenticatedSocket) {
    this.onlineUsers.delete(client.userId);
    console.log(`[Call] User ${client.userId} disconnected`);
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

      this.notifyUser(data.receiverId, 'call-incoming', {
        callId: call.id,
        callType: call.callType,
        callerId: client.userId,
        callerName: 'Caller',
        offer: data.offer,
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
}
