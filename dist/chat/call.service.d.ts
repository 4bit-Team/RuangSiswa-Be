import { Repository } from 'typeorm';
import { Call } from './entities/call.entity';
import { CreateCallDto, IceCandidateDto } from './dto/call.dto';
export declare class CallService {
    private callRepository;
    constructor(callRepository: Repository<Call>);
    initiateCall(callerId: number, dto: CreateCallDto): Promise<Call>;
    rejectCall(receiverId: number, callId: number, reason?: string): Promise<Call>;
    acceptCall(receiverId: number, callId: number, answer: string): Promise<Call>;
    saveCallerOffer(callerId: number, callId: number, offer: string): Promise<Call>;
    addIceCandidate(userId: number, dto: IceCandidateDto): Promise<Call>;
    endCall(userId: number, callId: number, duration?: number): Promise<Call>;
    getCall(callId: number): Promise<Call>;
    getMissedCalls(userId: number): Promise<Call[]>;
    getCallHistory(userId: number, otherUserId: number, limit?: number): Promise<Call[]>;
    getCallStats(userId: number): Promise<{
        totalCalls: number;
        totalDuration: number;
        averageDuration: number;
        missedCalls: number;
    }>;
    markAsMissed(callId: number): Promise<Call>;
    cleanupStaleRingingCalls(): Promise<void>;
}
