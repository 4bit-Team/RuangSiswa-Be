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
exports.CallGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const call_service_1 = require("./call.service");
const call_dto_1 = require("./dto/call.dto");
const rate_limiter_1 = require("./rate-limiter");
const ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'https://ruangsiswa.my.id',
    'http://ruangsiswa.my.id',
];
let CallGateway = class CallGateway {
    jwtService;
    callService;
    server;
    onlineUsers = new Map();
    callLimiter;
    iceLimiter;
    spamDetector;
    constructor(jwtService, callService) {
        this.jwtService = jwtService;
        this.callService = callService;
        this.callLimiter = new rate_limiter_1.RateLimiter({
            windowMs: 60000,
            maxRequests: 20,
            message: 'Too many call attempts. Please try again later.',
        });
        this.iceLimiter = new rate_limiter_1.RateLimiter({
            windowMs: 60000,
            maxRequests: 100,
            message: 'Too many ICE candidates. Possible DDoS attempt.',
        });
        this.spamDetector = new rate_limiter_1.IceCandidateSpamDetector();
    }
    getJwtSecret() {
        const secret = process.env.JWT_SECRET || 'your-secret-key';
        if (!secret || secret === 'your-secret-key') {
            console.warn('[Call] ⚠️ WARNING: Using default JWT secret. Set JWT_SECRET environment variable!');
        }
        return secret;
    }
    afterInit() {
        console.log('[WebSocket] Call gateway initialized');
        this.server.on('error', (error) => {
            console.error('[Call] Server error:', error);
        });
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth.token;
            if (!token) {
                console.error('[Call] No token provided');
                client.disconnect();
                return;
            }
            let payload;
            try {
                payload = this.jwtService.verify(token, {
                    secret: this.getJwtSecret(),
                });
                console.log('[Call] JWT Payload:', payload);
            }
            catch (jwtError) {
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
            this.onlineUsers.set(client.userId, client.id);
            console.log(`[Call] User ${client.userId} connected with socket ${client.id}`);
        }
        catch (error) {
            console.error('[Call] Authentication failed:', error instanceof Error ? error.message : String(error));
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        if (client.userId) {
            this.onlineUsers.delete(client.userId);
            console.log(`[Call] User ${client.userId} disconnected from /call namespace`);
        }
        else {
            console.warn(`[Call] Unknown user disconnected`);
        }
    }
    handleError(client, error) {
        console.error(`[Call] Connection error for user ${client.userId}:`, error);
    }
    async handleCallInitiate(client, data) {
        try {
            if (!client.userId) {
                throw new Error('User not authenticated or userId is missing');
            }
            const userBlock = this.callLimiter.isBlocked(client.userId);
            if (userBlock.blocked) {
                console.warn(`🚫 [Call] Blocked user ${client.userId} attempted call`);
                return {
                    status: 'error',
                    message: `You are temporarily blocked from making calls: ${userBlock.reason}`,
                };
            }
            const rateCheck = this.callLimiter.check(`call:${client.userId}`);
            if (!rateCheck.allowed) {
                console.warn(`⚠️ [Call] Call rate limit exceeded for user ${client.userId}`);
                this.callLimiter.blockUser(client.userId, 600000, 'Call rate limit exceeded');
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
        }
        catch (error) {
            console.error('[Call] Error initiating call:', error.message);
            return {
                status: 'error',
                message: error.message,
            };
        }
    }
    async handleCallOffer(client, data) {
        try {
            const call = await this.callService.saveCallerOffer(client.userId, data.callId, data.offer);
            this.notifyUser(call.receiverId, 'call-offer', {
                callId: data.callId,
                offer: data.offer,
                iceCandidates: data.iceCandidates ? JSON.parse(data.iceCandidates) : [],
                timestamp: new Date(),
            });
            console.log(`[Call] Call offer sent: ${client.userId} → ${call.receiverId}`);
            return { status: 'offer-sent' };
        }
        catch (error) {
            console.error('[Call] Error sending offer:', error.message);
            return { status: 'error', message: error.message };
        }
    }
    async handleCallAccept(client, data) {
        try {
            const call = await this.callService.acceptCall(client.userId, data.callId, data.answer);
            if (call.receiverAnswer && call.receiverAnswer !== data.answer) {
                console.warn(`[Call] ⚠️ Answer already processed for call ${data.callId}, ignoring duplicate`);
                return { status: 'accepted' };
            }
            this.notifyUser(call.callerId, 'call-answer', {
                callId: data.callId,
                answer: data.answer,
                iceCandidates: data.iceCandidates ? JSON.parse(data.iceCandidates) : [],
                timestamp: new Date(),
            });
            console.log(`[Call] Call accepted: ${client.userId} accepting from ${call.callerId}`);
            return { status: 'accepted' };
        }
        catch (error) {
            console.error('[Call] Error accepting call:', error.message);
            return { status: 'error', message: error.message };
        }
    }
    async handleCallReject(client, data) {
        try {
            const call = await this.callService.rejectCall(client.userId, data.callId, data.reason);
            this.notifyUser(call.callerId, 'call-rejected', {
                callId: data.callId,
                reason: data.reason || 'User declined',
                timestamp: new Date(),
            });
            console.log(`[Call] Call rejected: ${client.userId} rejecting from ${call.callerId}`);
            return { status: 'rejected' };
        }
        catch (error) {
            console.error('[Call] Error rejecting call:', error.message);
            return { status: 'error', message: error.message };
        }
    }
    async handleCallEnd(client, data) {
        try {
            const call = await this.callService.endCall(client.userId, data.callId, data.duration);
            const otherUserId = call.callerId === client.userId ? call.receiverId : call.callerId;
            this.notifyUser(otherUserId, 'call-ended', {
                callId: data.callId,
                duration: call.duration,
                timestamp: new Date(),
            });
            console.log(`[Call] Call ended: ${client.userId} (duration: ${call.duration}s)`);
            return {
                status: 'ended',
                duration: call.duration,
            };
        }
        catch (error) {
            console.error('[Call] Error ending call:', error.message);
            return { status: 'error', message: error.message };
        }
    }
    async handleIceCandidate(client, data) {
        try {
            const candidateType = data.candidate?.includes('typ host') ? '🏠 HOST' :
                data.candidate?.includes('typ srflx') ? '🔀 SRFLX' :
                    data.candidate?.includes('typ relay') ? '🔁 RELAY' : '❓ UNKNOWN';
            console.log(`📥 [Call] ICE candidate received from user ${client.userId} (${candidateType}):`, {
                callId: data.callId,
                candidateHash: data.candidate?.substring(0, 50) || 'NONE',
                sdpMLineIndex: data.sdpMLineIndex,
                sdpMid: data.sdpMid,
            });
            const userBlock = this.iceLimiter.isBlocked(client.userId);
            if (userBlock.blocked) {
                console.warn(`🚫 [Call] Blocked user ${client.userId} attempted ICE candidate spam`);
                return {
                    status: 'error',
                    message: `You are temporarily blocked: ${userBlock.reason}`,
                };
            }
            if (!data.candidate) {
                console.warn(`⚠️ [Call] Invalid ICE candidate from user ${client.userId}: missing candidate string`);
                return {
                    status: 'error',
                    message: 'Invalid ICE candidate: missing candidate string',
                };
            }
            if (!data.callId) {
                console.warn(`⚠️ [Call] ICE candidate from user ${client.userId} has NO callId - candidate will be DROPPED. Check frontend for ICE callId tracking issue.`);
                return {
                    status: 'error',
                    message: 'ICE candidate rejected: callId is required. Please ensure call is properly initiated.',
                };
            }
            const spamCheck = this.spamDetector.checkSpam(client.userId, data.callId);
            if (spamCheck.spam) {
                const reason = spamCheck.reason || 'ICE candidate spam detected';
                console.warn(`🚨 [Call] ICE spam detected from user ${client.userId}: ${reason}`);
                this.iceLimiter.blockUser(client.userId, 1800000, reason);
                console.error(`[SECURITY] POTENTIAL DDoS ATTACK - User ${client.userId} blocked for spam: ${reason}`);
                return {
                    status: 'error',
                    message: 'Possible DDoS attempt detected. You have been temporarily blocked.',
                };
            }
            const rateCheck = this.iceLimiter.check(`ice:${client.userId}`);
            if (!rateCheck.allowed) {
                console.warn(`⚠️ [Call] ICE rate limit exceeded for user ${client.userId}`);
                this.iceLimiter.blockUser(client.userId, 600000, 'ICE candidate rate limit exceeded');
                return {
                    status: 'error',
                    message: rateCheck.message,
                };
            }
            const call = await this.callService.addIceCandidate(client.userId, data);
            const otherUserId = call.callerId === client.userId ? call.receiverId : call.callerId;
            console.log(`📤 [Call] Forwarding ICE candidate to user ${otherUserId}:`, {
                fromUser: client.userId,
                toUser: otherUserId,
                candidateType: candidateType,
                callId: data.callId,
                callState: call.status,
            });
            const recipientSocketId = this.onlineUsers.get(otherUserId);
            if (!recipientSocketId) {
                console.warn(`⚠️ [Call] Recipient user ${otherUserId} is not online, cannot forward ICE candidate`);
                return {
                    status: 'warning',
                    message: 'Recipient is not online, candidate queued for later delivery',
                };
            }
            this.server.to(recipientSocketId).emit('ice-candidate', {
                callId: data.callId,
                candidate: data.candidate,
                sdpMLineIndex: data.sdpMLineIndex,
                sdpMid: data.sdpMid,
                timestamp: new Date(),
            });
            console.log(`✅ [Call] ICE candidate successfully forwarded to user ${otherUserId}`);
            return { status: 'ice-candidate-sent' };
        }
        catch (error) {
            console.error('[Call] Error sending ICE candidate:', error.message);
            return { status: 'error', message: error.message };
        }
    }
    async handleGetCallHistory(client, data) {
        try {
            const calls = await this.callService.getCallHistory(client.userId, data.otherUserId, 20);
            return {
                status: 'success',
                calls,
            };
        }
        catch (error) {
            console.error('[Call] Error getting call history:', error.message);
            return { status: 'error', message: error.message };
        }
    }
    async handleGetCallStats(client) {
        try {
            const stats = await this.callService.getCallStats(client.userId);
            return {
                status: 'success',
                stats,
            };
        }
        catch (error) {
            console.error('[Call] Error getting call stats:', error.message);
            return { status: 'error', message: error.message };
        }
    }
    notifyUser(userId, event, data) {
        const socketId = this.onlineUsers.get(userId);
        if (socketId) {
            this.server.to(socketId).emit(event, data);
            console.log(`[Call] Event '${event}' sent to user ${userId}`);
        }
        else {
            console.warn(`[Call] User ${userId} is not online, cannot send '${event}'`);
        }
    }
    handleUnblockUser(client, data) {
        try {
            const unblockedIce = this.iceLimiter.unblockUser(data.userId);
            const unblockedSpam = this.spamDetector.unblockUser(data.userId);
            const unblockedCall = this.callLimiter.unblockUser(data.userId);
            console.log(`🔓 [Call] Debug unblock requested by user ${client.userId} for user ${data.userId}`, { unblockedIce, unblockedSpam, unblockedCall });
            return {
                status: 'success',
                message: `User ${data.userId} unblocked`,
                unblocked: {
                    ice: unblockedIce,
                    spam: unblockedSpam,
                    call: unblockedCall,
                },
            };
        }
        catch (error) {
            console.error('[Call] Error unblocking user:', error.message);
            return { status: 'error', message: error.message };
        }
    }
    getBlockedUsers() {
        return this.callLimiter.getBlockedUsers();
    }
    getSuspiciousUsers() {
        return this.spamDetector.getSuspiciousUsers();
    }
    unblockUserAdmin(userId) {
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
};
exports.CallGateway = CallGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], CallGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('call-initiate'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, call_dto_1.CreateCallDto]),
    __metadata("design:returntype", Promise)
], CallGateway.prototype, "handleCallInitiate", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('call-offer'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, call_dto_1.CallOfferDto]),
    __metadata("design:returntype", Promise)
], CallGateway.prototype, "handleCallOffer", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('call-accept'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, call_dto_1.CallAnswerDto]),
    __metadata("design:returntype", Promise)
], CallGateway.prototype, "handleCallAccept", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('call-reject'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, call_dto_1.CallRejectDto]),
    __metadata("design:returntype", Promise)
], CallGateway.prototype, "handleCallReject", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('call-end'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, call_dto_1.CallEndDto]),
    __metadata("design:returntype", Promise)
], CallGateway.prototype, "handleCallEnd", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('ice-candidate'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, call_dto_1.IceCandidateDto]),
    __metadata("design:returntype", Promise)
], CallGateway.prototype, "handleIceCandidate", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('get-call-history'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CallGateway.prototype, "handleGetCallHistory", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('get-call-stats'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CallGateway.prototype, "handleGetCallStats", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('debug:unblock-user'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CallGateway.prototype, "handleUnblockUser", null);
exports.CallGateway = CallGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: ALLOWED_ORIGINS,
            methods: ['GET', 'POST'],
            credentials: true,
        },
        namespace: '/call',
        pingInterval: 25000,
        pingTimeout: 5000,
    }),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        call_service_1.CallService])
], CallGateway);
//# sourceMappingURL=call.gateway.js.map