import { Injectable } from '@nestjs/common';
import { CallGateway } from '../chat/call.gateway';

@Injectable()
export class AdminService {
  constructor(private callGateway: CallGateway) {}

  /**
   * Get list of currently blocked users from rate limiter
   */
  async getBlockedUsers() {
    return this.callGateway.getBlockedUsers();
  }

  /**
   * Get list of suspicious users from spam detector
   */
  async getSuspiciousUsers() {
    return this.callGateway.getSuspiciousUsers();
  }

  /**
   * Unblock a user (from both blocked and suspicious lists)
   * Handles both string and number userId
   */
  async unblockUser(userId: number | string) {
    const userIdNum = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    console.log(`[ADMIN_SERVICE] 🔓 Unblocking user ${userIdNum}... (Input: "${userId}" type: ${typeof userId})`);
    
    const result = this.callGateway.unblockUserAdmin(userIdNum);
    
    console.log(`[ADMIN_SERVICE] Result for user ${userIdNum}: ${result}`);
    console.log(`[ADMIN_SERVICE] 📊 Remaining blocked: ${this.callGateway.getBlockedUsers().length}, Suspicious: ${this.callGateway.getSuspiciousUsers().length}`);
    
    return result;
  }
}
