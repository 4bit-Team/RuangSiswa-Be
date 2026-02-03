export interface RateLimitConfig {
    windowMs: number;
    maxRequests: number;
    message: string;
}
export interface UserRateLimit {
    count: number;
    resetTime: number;
    blocked: boolean;
    blockReason?: string;
}
export declare class RateLimiter {
    private limits;
    private config;
    private blockedUsers;
    constructor(config: RateLimitConfig);
    check(identifier: string): {
        allowed: boolean;
        message?: string;
    };
    blockUser(userId: number, durationMs: number, reason: string): void;
    isBlocked(userId: number): {
        blocked: boolean;
        reason?: string;
    };
    unblockUser(userId: number | string): boolean;
    getStats(identifier: string): {
        count: number;
        maxRequests: number;
        resetIn: number;
        blocked: boolean;
    } | null;
    private cleanupInterval;
    reset(): void;
    getBlockedUsers(): Array<{
        userId: number;
        reason: string;
        blockedUntil: number;
        remainingMs: number;
    }>;
}
export declare class IceCandidateSpamDetector {
    private userCandidateCounts;
    private suspiciousUsers;
    private readonly MAX_CANDIDATES_PER_CALL;
    private readonly MAX_CANDIDATES_PER_MINUTE;
    private readonly SPAM_THRESHOLD;
    checkSpam(userId: number, callId: number): {
        spam: boolean;
        reason?: string;
    };
    isSuspicious(userId: number): boolean;
    unblockUser(userId: number | string): boolean;
    getStats(userId: number): {
        count: number;
        suspicious: boolean;
        maxThreshold: number;
    };
    reset(): void;
    getSuspiciousUsers(): Array<{
        userId: number;
        candidateCount: number;
    }>;
}
