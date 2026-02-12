import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { CallService } from './call.service';
import { CreateCallDto, CallOfferDto, CallAnswerDto, CallRejectDto, CallEndDto, IceCandidateDto } from './dto/call.dto';
interface AuthenticatedSocket extends Socket {
    userId: number;
}
export declare class CallGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    private callService;
    server: Server;
    private onlineUsers;
    private callLimiter;
    private iceLimiter;
    private spamDetector;
    constructor(jwtService: JwtService, callService: CallService);
    private getJwtSecret;
    afterInit(): void;
    handleConnection(client: AuthenticatedSocket): Promise<void>;
    handleDisconnect(client: AuthenticatedSocket): void;
    handleError(client: AuthenticatedSocket, error: any): void;
    handleCallInitiate(client: AuthenticatedSocket, data: CreateCallDto): Promise<{
        status: string;
        callId: number;
        message?: undefined;
    } | {
        status: string;
        message: any;
        callId?: undefined;
    }>;
    handleCallOffer(client: AuthenticatedSocket, data: CallOfferDto): Promise<{
        status: string;
        message?: undefined;
    } | {
        status: string;
        message: any;
    }>;
    handleCallAccept(client: AuthenticatedSocket, data: CallAnswerDto): Promise<{
        status: string;
        message?: undefined;
    } | {
        status: string;
        message: any;
    }>;
    handleCallReject(client: AuthenticatedSocket, data: CallRejectDto): Promise<{
        status: string;
        message?: undefined;
    } | {
        status: string;
        message: any;
    }>;
    handleCallEnd(client: AuthenticatedSocket, data: CallEndDto): Promise<{
        status: string;
        duration: number;
        message?: undefined;
    } | {
        status: string;
        message: any;
        duration?: undefined;
    }>;
    handleIceCandidate(client: AuthenticatedSocket, data: IceCandidateDto): Promise<{
        status: string;
        message?: undefined;
    } | {
        status: string;
        message: any;
    }>;
    handleGetCallHistory(client: AuthenticatedSocket, data: {
        otherUserId: number;
    }): Promise<{
        status: string;
        calls: import("./entities/call.entity").Call[];
        message?: undefined;
    } | {
        status: string;
        message: any;
        calls?: undefined;
    }>;
    handleGetCallStats(client: AuthenticatedSocket): Promise<{
        status: string;
        stats: {
            totalCalls: number;
            totalDuration: number;
            averageDuration: number;
            missedCalls: number;
        };
        message?: undefined;
    } | {
        status: string;
        message: any;
        stats?: undefined;
    }>;
    private notifyUser;
    handleUnblockUser(client: AuthenticatedSocket, data: {
        userId: number;
    }): {
        status: string;
        message: string;
        unblocked: {
            ice: boolean;
            spam: boolean;
            call: boolean;
        };
    } | {
        status: string;
        message: any;
        unblocked?: undefined;
    };
    getBlockedUsers(): {
        userId: number;
        reason: string;
        blockedUntil: number;
        remainingMs: number;
    }[];
    getSuspiciousUsers(): {
        userId: number;
        candidateCount: number;
    }[];
    unblockUserAdmin(userId: number | string): boolean;
}
export {};
