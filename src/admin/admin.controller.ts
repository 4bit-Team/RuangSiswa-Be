import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  /**
   * Get list of currently blocked users (ICE spam)
   */
  @Get('blocked-users')
  async getBlockedUsers() {
    const blockedUsers = await this.adminService.getBlockedUsers();
    return {
      status: 'success',
      data: blockedUsers,
      total: blockedUsers.length,
    };
  }

  /**
   * Get list of suspicious users (ICE spam detector)
   */
  @Get('suspicious-users')
  async getSuspiciousUsers() {
    const suspiciousUsers = await this.adminService.getSuspiciousUsers();
    return {
      status: 'success',
      data: suspiciousUsers,
      total: suspiciousUsers.length,
    };
  }

  /**
   * Manually unblock a user
   */
  @Post('unblock/:userId')
  async unblockUser(@Param('userId') userId: number) {
    const result = await this.adminService.unblockUser(userId);
    return {
      status: 'success',
      message: result ? 'User unblocked successfully' : 'User not found in blocklist',
      unblocked: result,
    };
  }
}
