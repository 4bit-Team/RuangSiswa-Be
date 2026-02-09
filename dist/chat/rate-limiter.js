"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IceCandidateSpamDetector = exports.RateLimiter = void 0;
class RateLimiter {
    limits = new Map();
    config;
    blockedUsers = new Map();
    constructor(config) {
        this.config = config;
        this.cleanupInterval();
    }
    check(identifier) {
        const now = Date.now();
        const limit = this.limits.get(identifier);
        if (!limit || now > limit.resetTime) {
            this.limits.set(identifier, {
                count: 1,
                resetTime: now + this.config.windowMs,
                blocked: false,
            });
            return { allowed: true };
        }
        if (limit.blocked) {
            return {
                allowed: false,
                message: `Too many requests. Try again later. Reason: ${limit.blockReason}`,
            };
        }
        limit.count++;
        if (limit.count > this.config.maxRequests) {
            limit.blocked = true;
            limit.blockReason = this.config.message;
            return {
                allowed: false,
                message: this.config.message,
            };
        }
        return { allowed: true };
    }
    blockUser(userId, durationMs, reason) {
        this.blockedUsers.set(userId, {
            until: Date.now() + durationMs,
            reason,
        });
        console.log(`🚫 [RateLimiter] User ${userId} blocked: ${reason}`);
    }
    isBlocked(userId) {
        const block = this.blockedUsers.get(userId);
        if (!block)
            return { blocked: false };
        if (Date.now() > block.until) {
            this.blockedUsers.delete(userId);
            return { blocked: false };
        }
        return { blocked: true, reason: block.reason };
    }
    unblockUser(userId) {
        const userIdNum = typeof userId === 'string' ? parseInt(userId, 10) : userId;
        console.log(`[RateLimiter] 🔍 Attempting to unblock user ${userIdNum}`);
        console.log(`[RateLimiter] - Input userId: "${userId}" (type: ${typeof userId}), Converted to: ${userIdNum} (type: ${typeof userIdNum})`);
        console.log(`[RateLimiter] - Current blocked users: ${Array.from(this.blockedUsers.keys()).join(', ') || '(none)'}`);
        console.log(`[RateLimiter] - Has user ${userIdNum}? ${this.blockedUsers.has(userIdNum)}`);
        if (this.blockedUsers.has(userIdNum)) {
            this.blockedUsers.delete(userIdNum);
            console.log(`✅ [RateLimiter] User ${userIdNum} unblocked from BLOCKED list`);
            console.log(`[RateLimiter] - Remaining blocked: ${Array.from(this.blockedUsers.keys()).join(', ') || '(none)'}`);
            return true;
        }
        console.log(`❌ [RateLimiter] User ${userIdNum} NOT found in blocked list`);
        return false;
    }
    getStats(identifier) {
        const limit = this.limits.get(identifier);
        if (!limit)
            return null;
        return {
            count: limit.count,
            maxRequests: this.config.maxRequests,
            resetIn: Math.max(0, limit.resetTime - Date.now()),
            blocked: limit.blocked,
        };
    }
    cleanupInterval() {
        setInterval(() => {
            const now = Date.now();
            const expiredKeys = [];
            this.limits.forEach((limit, key) => {
                if (now > limit.resetTime) {
                    expiredKeys.push(key);
                }
            });
            expiredKeys.forEach((key) => this.limits.delete(key));
            const expiredBlocks = [];
            this.blockedUsers.forEach((block, userId) => {
                if (now > block.until) {
                    expiredBlocks.push(userId);
                }
            });
            expiredBlocks.forEach((userId) => this.blockedUsers.delete(userId));
        }, 60000);
    }
    reset() {
        this.limits.clear();
        this.blockedUsers.clear();
    }
    getBlockedUsers() {
        const now = Date.now();
        const result = [];
        this.blockedUsers.forEach((block, userId) => {
            const remainingMs = Math.max(0, block.until - now);
            result.push({
                userId,
                reason: block.reason,
                blockedUntil: block.until,
                remainingMs,
            });
        });
        return result;
    }
}
exports.RateLimiter = RateLimiter;
class IceCandidateSpamDetector {
    userCandidateCounts = new Map();
    suspiciousUsers = new Set();
    MAX_CANDIDATES_PER_CALL = 100;
    MAX_CANDIDATES_PER_MINUTE = 500;
    SPAM_THRESHOLD = 50;
    checkSpam(userId, callId) {
        const key = `${userId}:${callId}`;
        const now = Date.now();
        let record = this.userCandidateCounts.get(userId);
        if (!record || now - record.timestamp > 60000) {
            console.log(`[IceSpamDetector] Resetting user ${userId} spam count (>60s elapsed)`);
            if (this.suspiciousUsers.has(userId)) {
                console.log(`[IceSpamDetector] Removing user ${userId} from suspicious list (counter reset)`);
                this.suspiciousUsers.delete(userId);
            }
            record = {
                callId,
                count: 0,
                timestamp: now,
            };
            this.userCandidateCounts.set(userId, record);
        }
        record.count++;
        if (record.count > this.MAX_CANDIDATES_PER_CALL) {
            console.warn(`⚠️ [IceSpamDetector] User ${userId} exceeded max candidates per call (${record.count})`);
            return {
                spam: true,
                reason: `Too many ICE candidates (${record.count} > ${this.MAX_CANDIDATES_PER_CALL})`,
            };
        }
        if (record.count > this.SPAM_THRESHOLD) {
            console.warn(`⚠️ [IceSpamDetector] User ${userId} sending candidates too fast (${record.count} in 10s)`);
            this.suspiciousUsers.add(userId);
            return {
                spam: true,
                reason: `ICE candidate spam detected (${record.count} candidates too fast)`,
            };
        }
        return { spam: false };
    }
    isSuspicious(userId) {
        return this.suspiciousUsers.has(userId);
    }
    unblockUser(userId) {
        const userIdNum = typeof userId === 'string' ? parseInt(userId, 10) : userId;
        console.log(`[IceSpamDetector] 🔍 Attempting to unblock user ${userIdNum}`);
        console.log(`[IceSpamDetector] - Input userId: "${userId}" (type: ${typeof userId}), Converted to: ${userIdNum} (type: ${typeof userIdNum})`);
        console.log(`[IceSpamDetector] - Current suspicious users: ${Array.from(this.suspiciousUsers).join(', ') || '(none)'}`);
        console.log(`[IceSpamDetector] - Has user ${userIdNum}? ${this.suspiciousUsers.has(userIdNum)}`);
        if (this.suspiciousUsers.has(userIdNum)) {
            this.suspiciousUsers.delete(userIdNum);
            console.log(`✅ [IceSpamDetector] User ${userIdNum} unblocked from SUSPICIOUS list`);
            console.log(`[IceSpamDetector] - Remaining suspicious: ${Array.from(this.suspiciousUsers).join(', ') || '(none)'}`);
            return true;
        }
        console.log(`❌ [IceSpamDetector] User ${userIdNum} NOT found in suspicious list`);
        return false;
    }
    getStats(userId) {
        const record = this.userCandidateCounts.get(userId);
        return {
            count: record?.count || 0,
            suspicious: this.isSuspicious(userId),
            maxThreshold: this.MAX_CANDIDATES_PER_CALL,
        };
    }
    reset() {
        this.userCandidateCounts.clear();
        this.suspiciousUsers.clear();
    }
    getSuspiciousUsers() {
        const result = [];
        console.log(`[IceSpamDetector] getSuspiciousUsers() - Current set size: ${this.suspiciousUsers.size}`);
        console.log(`[IceSpamDetector] getSuspiciousUsers() - Users in set: ${Array.from(this.suspiciousUsers).join(', ')}`);
        this.suspiciousUsers.forEach((userId) => {
            const record = this.userCandidateCounts.get(userId);
            console.log(`[IceSpamDetector] - User ${userId}: count=${record?.count || 0}, timestamp=${record?.timestamp}`);
            result.push({
                userId,
                candidateCount: record?.count || 0,
            });
        });
        return result;
    }
}
exports.IceCandidateSpamDetector = IceCandidateSpamDetector;
//# sourceMappingURL=rate-limiter.js.map