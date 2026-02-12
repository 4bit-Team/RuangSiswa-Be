import { CallGateway } from '../chat/call.gateway';
export declare class AdminService {
    private callGateway;
    constructor(callGateway: CallGateway);
    getBlockedUsers(): Promise<{
        userId: number;
        reason: string;
        blockedUntil: number;
        remainingMs: number;
    }[]>;
    getSuspiciousUsers(): Promise<{
        userId: number;
        candidateCount: number;
    }[]>;
    unblockUser(userId: number | string): Promise<boolean>;
}
