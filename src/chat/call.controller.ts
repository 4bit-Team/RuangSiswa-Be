import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { CallService } from './call.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CreateCallDto } from './dto/call.dto';

@Controller('calls')
@UseGuards(JwtAuthGuard)
export class CallController {
  constructor(private callService: CallService) {}

  /**
   * Initiate a new call
   */
  @Post('initiate')
  async initiateCall(@Request() req, @Body() dto: CreateCallDto) {
    const call = await this.callService.initiateCall(req.user.id, dto);

    return {
      status: 'success',
      call,
    };
  }

  /**
   * Get call details
   */
  @Get(':callId')
  async getCall(@Param('callId') callId: number) {
    const call = await this.callService.getCall(callId);

    return {
      status: 'success',
      call,
    };
  }

  /**
   * Get call history with specific user
   */
  @Get('history/:otherUserId')
  async getCallHistory(
    @Request() req,
    @Param('otherUserId') otherUserId: number,
    @Query('limit') limit: number = 50,
  ) {
    const calls = await this.callService.getCallHistory(
      req.user.id,
      otherUserId,
      limit,
    );

    return {
      status: 'success',
      calls,
      total: calls.length,
    };
  }

  /**
   * Get missed calls
   */
  @Get('missed/list')
  async getMissedCalls(@Request() req) {
    const missedCalls = await this.callService.getMissedCalls(req.user.id);

    return {
      status: 'success',
      missedCalls,
      count: missedCalls.length,
    };
  }

  /**
   * Get call statistics
   */
  @Get('stats/summary')
  async getCallStats(@Request() req) {
    const stats = await this.callService.getCallStats(req.user.id);

    return {
      status: 'success',
      stats,
    };
  }

  /**
   * Mark call as missed
   */
  @Post(':callId/missed')
  async markAsMissed(@Param('callId') callId: number) {
    const call = await this.callService.markAsMissed(callId);

    return {
      status: 'success',
      call,
    };
  }

  /**
   * Clean up stale ringing calls
   */
  @Post('maintenance/cleanup')
  async cleanupStaleRingingCalls() {
    await this.callService.cleanupStaleRingingCalls();

    return {
      status: 'success',
      message: 'Stale ringing calls cleaned up',
    };
  }
}
