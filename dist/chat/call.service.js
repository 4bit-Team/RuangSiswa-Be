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
exports.CallService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const call_entity_1 = require("./entities/call.entity");
let CallService = class CallService {
    callRepository;
    constructor(callRepository) {
        this.callRepository = callRepository;
    }
    async initiateCall(callerId, dto) {
        console.log(`[CallService] initiateCall called with callerId: ${callerId}, dto:`, dto);
        if (!callerId) {
            throw new Error('callerId is required and must not be null');
        }
        const activeCall = await this.callRepository.findOne({
            where: [
                {
                    callerId: callerId,
                    status: call_entity_1.CallStatus.ACTIVE,
                },
                {
                    receiverId: callerId,
                    status: call_entity_1.CallStatus.ACTIVE,
                },
            ],
        });
        if (activeCall) {
            throw new Error('You already have an active call');
        }
        const callData = {
            conversationId: dto.conversationId,
            callType: dto.callType,
            status: call_entity_1.CallStatus.INITIATED,
            ringingStartedAt: new Date(),
            callerId: callerId,
            receiverId: dto.receiverId,
        };
        console.log(`[CallService] Creating call with data:`, callData);
        const newCall = this.callRepository.create(callData);
        const result = await this.callRepository.save(newCall);
        if (!result) {
            throw new Error('Failed to create call');
        }
        console.log(`[CallService] Call saved successfully:`, result);
        return result;
    }
    async rejectCall(receiverId, callId, reason) {
        const call = await this.callRepository.findOne({
            where: { id: callId },
        });
        if (!call) {
            throw new common_1.NotFoundException('Call not found');
        }
        if (call.receiverId !== receiverId) {
            throw new common_1.ForbiddenException('Only receiver can reject call');
        }
        call.status = call_entity_1.CallStatus.REJECTED;
        call.rejectionReason = reason || 'User declined';
        call.endedAt = new Date();
        return this.callRepository.save(call);
    }
    async acceptCall(receiverId, callId, answer) {
        const call = await this.callRepository.findOne({
            where: { id: callId },
        });
        if (!call) {
            throw new common_1.NotFoundException('Call not found');
        }
        if (call.receiverId !== receiverId) {
            throw new common_1.ForbiddenException('Only receiver can accept call');
        }
        call.status = call_entity_1.CallStatus.ACCEPTED;
        call.receiverAnswer = answer;
        call.acceptedAt = new Date();
        return this.callRepository.save(call);
    }
    async saveCallerOffer(callerId, callId, offer) {
        const call = await this.callRepository.findOne({
            where: { id: callId },
        });
        if (!call) {
            throw new common_1.NotFoundException('Call not found');
        }
        if (call.callerId !== callerId) {
            throw new common_1.ForbiddenException('Only caller can save offer');
        }
        call.callerOffer = offer;
        call.status = call_entity_1.CallStatus.RINGING;
        return this.callRepository.save(call);
    }
    async addIceCandidate(userId, dto) {
        const call = await this.callRepository.findOne({
            where: { id: dto.callId },
        });
        if (!call) {
            throw new common_1.NotFoundException('Call not found');
        }
        if (call.callerId !== userId && call.receiverId !== userId) {
            throw new common_1.ForbiddenException('User not part of this call');
        }
        if (!call.iceCandidates) {
            call.iceCandidates = [];
        }
        call.iceCandidates.push(dto.candidate);
        return this.callRepository.save(call);
    }
    async endCall(userId, callId, duration) {
        const call = await this.callRepository.findOne({
            where: { id: callId },
        });
        if (!call) {
            throw new common_1.NotFoundException('Call not found');
        }
        if (call.callerId !== userId && call.receiverId !== userId) {
            throw new common_1.ForbiddenException('User not part of this call');
        }
        call.status = call_entity_1.CallStatus.ENDED;
        call.endedAt = new Date();
        if (duration) {
            call.duration = duration;
        }
        else if (call.acceptedAt) {
            call.duration = Math.floor((new Date().getTime() - call.acceptedAt.getTime()) / 1000);
        }
        return this.callRepository.save(call);
    }
    async getCall(callId) {
        const call = await this.callRepository.findOne({
            where: { id: callId },
            relations: ['caller', 'receiver'],
        });
        if (!call) {
            throw new common_1.NotFoundException('Call not found');
        }
        return call;
    }
    async getMissedCalls(userId) {
        const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
        const missedCalls = await this.callRepository.find({
            where: {
                receiverId: userId,
                status: call_entity_1.CallStatus.INITIATED,
                ringingStartedAt: {
                    $lt: twoMinutesAgo,
                },
            },
            relations: ['caller'],
        });
        return missedCalls;
    }
    async getCallHistory(userId, otherUserId, limit = 50) {
        const calls = await this.callRepository.find({
            where: [
                {
                    callerId: userId,
                    receiverId: otherUserId,
                },
                {
                    callerId: otherUserId,
                    receiverId: userId,
                },
            ],
            order: { createdAt: 'DESC' },
            take: limit,
        });
        return calls;
    }
    async getCallStats(userId) {
        const completedCalls = await this.callRepository.find({
            where: [
                {
                    callerId: userId,
                    status: call_entity_1.CallStatus.ENDED,
                },
                {
                    receiverId: userId,
                    status: call_entity_1.CallStatus.ENDED,
                },
            ],
        });
        const totalDuration = completedCalls.reduce((sum, call) => sum + (call.duration || 0), 0);
        const missedCalls = await this.callRepository.count({
            where: {
                receiverId: userId,
                status: call_entity_1.CallStatus.REJECTED,
            },
        });
        return {
            totalCalls: completedCalls.length,
            totalDuration,
            averageDuration: completedCalls.length > 0 ? totalDuration / completedCalls.length : 0,
            missedCalls,
        };
    }
    async markAsMissed(callId) {
        const call = await this.callRepository.findOne({
            where: { id: callId },
        });
        if (!call) {
            throw new common_1.NotFoundException('Call not found');
        }
        call.status = call_entity_1.CallStatus.MISSED;
        call.endedAt = new Date();
        return this.callRepository.save(call);
    }
    async cleanupStaleRingingCalls() {
        const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
        const staleCalls = await this.callRepository.find({
            where: {
                status: call_entity_1.CallStatus.INITIATED,
                ringingStartedAt: {
                    $lt: twoMinutesAgo,
                },
            },
        });
        if (staleCalls.length > 0) {
            staleCalls.forEach((call) => {
                call.status = call_entity_1.CallStatus.MISSED;
                call.endedAt = new Date();
            });
            await this.callRepository.save(staleCalls);
        }
    }
};
exports.CallService = CallService;
exports.CallService = CallService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(call_entity_1.Call)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CallService);
//# sourceMappingURL=call.service.js.map