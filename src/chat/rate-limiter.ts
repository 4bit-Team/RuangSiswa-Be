/**
 * Rate Limiter untuk WebSocket Events
 * Deteksi dan cegah spam/DDoS
 */

export interface RateLimitConfig {
  windowMs: number; // Time window dalam milliseconds
  maxRequests: number; // Max requests per window
  message: string;
}

export interface UserRateLimit {
  count: number;
  resetTime: number;
  blocked: boolean;
  blockReason?: string;
}

export class RateLimiter {
  private limits = new Map<string, UserRateLimit>();
  private config: RateLimitConfig;
  private blockedUsers = new Map<number, { until: number; reason: string }>();

  constructor(config: RateLimitConfig) {
    this.config = config;
    this.cleanupInterval();
  }

  /**
   * Check if user exceeds rate limit
   */
  check(identifier: string): { allowed: boolean; message?: string } {
    const now = Date.now();
    const limit = this.limits.get(identifier);

    // If no record or window expired, create new record
    if (!limit || now > limit.resetTime) {
      this.limits.set(identifier, {
        count: 1,
        resetTime: now + this.config.windowMs,
        blocked: false,
      });
      return { allowed: true };
    }

    // Check if user is blocked
    if (limit.blocked) {
      return {
        allowed: false,
        message: `Too many requests. Try again later. Reason: ${limit.blockReason}`,
      };
    }

    // Increment count
    limit.count++;

    // Check if exceeded
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

  /**
   * Block user temporarily
   */
  blockUser(userId: number, durationMs: number, reason: string) {
    this.blockedUsers.set(userId, {
      until: Date.now() + durationMs,
      reason,
    });
    console.log(`🚫 [RateLimiter] User ${userId} blocked: ${reason}`);
  }

  /**
   * Check if user is blocked
   */
  isBlocked(userId: number): { blocked: boolean; reason?: string } {
    const block = this.blockedUsers.get(userId);
    if (!block) return { blocked: false };

    if (Date.now() > block.until) {
      this.blockedUsers.delete(userId);
      return { blocked: false };
    }

    return { blocked: true, reason: block.reason };
  }

  /**
   * Get user stats
   */
  getStats(identifier: string) {
    const limit = this.limits.get(identifier);
    if (!limit) return null;

    return {
      count: limit.count,
      maxRequests: this.config.maxRequests,
      resetIn: Math.max(0, limit.resetTime - Date.now()),
      blocked: limit.blocked,
    };
  }

  /**
   * Cleanup expired records periodically
   */
  private cleanupInterval() {
    setInterval(() => {
      const now = Date.now();
      const expiredKeys: string[] = [];

      this.limits.forEach((limit, key) => {
        if (now > limit.resetTime) {
          expiredKeys.push(key);
        }
      });

      expiredKeys.forEach((key) => this.limits.delete(key));

      // Cleanup expired blocks
      const expiredBlocks: number[] = [];
      this.blockedUsers.forEach((block, userId) => {
        if (now > block.until) {
          expiredBlocks.push(userId);
        }
      });

      expiredBlocks.forEach((userId) => this.blockedUsers.delete(userId));
    }, 60000); // Run every 1 minute
  }

  /**
   * Reset all limits (useful for testing)
   */
  reset() {
    this.limits.clear();
    this.blockedUsers.clear();
  }
}

/**
 * Specialized DDoS Detector for ICE candidates
 */
export class IceCandidateSpamDetector {
  private userCandidateCounts = new Map<
    number,
    { callId: number; count: number; timestamp: number }
  >();
  private suspiciousUsers = new Set<number>();

  // Config
  private readonly MAX_CANDIDATES_PER_CALL = 100; // Max 100 ICE candidates per call
  private readonly MAX_CANDIDATES_PER_MINUTE = 500; // Max 500 per minute per user
  private readonly SPAM_THRESHOLD = 50; // Threshold to consider spam (per 10 seconds)

  /**
   * Check if ICE candidate is spam
   */
  checkSpam(userId: number, callId: number): { spam: boolean; reason?: string } {
    const key = `${userId}:${callId}`;
    const now = Date.now();
    let record = this.userCandidateCounts.get(userId);

    // Create or reset expired record
    if (!record || now - record.timestamp > 60000) {
      record = {
        callId,
        count: 0,
        timestamp: now,
      };
      this.userCandidateCounts.set(userId, record);
    }

    record.count++;

    // Check thresholds
    if (record.count > this.MAX_CANDIDATES_PER_CALL) {
      console.warn(
        `⚠️ [IceSpamDetector] User ${userId} exceeded max candidates per call (${record.count})`,
      );
      return {
        spam: true,
        reason: `Too many ICE candidates (${record.count} > ${this.MAX_CANDIDATES_PER_CALL})`,
      };
    }

    if (record.count > this.SPAM_THRESHOLD) {
      console.warn(
        `⚠️ [IceSpamDetector] User ${userId} sending candidates too fast (${record.count} in 10s)`,
      );
      this.suspiciousUsers.add(userId);
      return {
        spam: true,
        reason: `ICE candidate spam detected (${record.count} candidates too fast)`,
      };
    }

    return { spam: false };
  }

  /**
   * Check if user is suspicious
   */
  isSuspicious(userId: number): boolean {
    return this.suspiciousUsers.has(userId);
  }

  /**
   * Get spam stats
   */
  getStats(userId: number) {
    const record = this.userCandidateCounts.get(userId);
    return {
      count: record?.count || 0,
      suspicious: this.isSuspicious(userId),
      maxThreshold: this.MAX_CANDIDATES_PER_CALL,
    };
  }

  /**
   * Reset (for testing)
   */
  reset() {
    this.userCandidateCounts.clear();
    this.suspiciousUsers.clear();
  }
}
