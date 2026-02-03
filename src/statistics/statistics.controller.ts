import { Controller, Get, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import type { Request } from 'express';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('statistics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('dashboard')
  @Roles('bk')
  async getDashboardStatistics(@Req() req: Request) {
    const user = req.user as any;

    // Double check role authorization
    if (!user || user.role?.toLowerCase() !== 'bk') {
      throw new ForbiddenException(
        `User role '${user?.role || 'unknown'}' tidak diizinkan mengakses statistik. Hanya BK yang dapat mengakses.`,
      );
    }

    return this.statisticsService.getDashboardStatistics();
  }
}
