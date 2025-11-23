import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { BkScheduleService } from './bk-schedule.service';
import { CreateBkScheduleDto, UpdateBkScheduleDto } from './dto/create-bk-schedule.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';

@Controller('bk-schedule')
@UseGuards(JwtAuthGuard)
export class BkScheduleController {
  constructor(private readonly scheduleService: BkScheduleService) {}

  // Create atau update schedule untuk BK saat ini untuk session type tertentu
  @Post(':sessionType')
  async createOrUpdate(
    @Param('sessionType') sessionType: string,
    @Body() createDto: CreateBkScheduleDto,
    @Request() req,
  ) {
    // Set bkId dari authenticated user dan sessionType dari param
    createDto.bkId = req.user.id;
    createDto.sessionType = sessionType as 'tatap-muka' | 'chat';
    console.log('📝 Creating/Updating BK schedule:', createDto);
    return await this.scheduleService.createOrUpdate(createDto);
  }

  // Get all schedules untuk BK saat ini
  @Get('my-schedules')
  async getMySchedules(@Request() req) {
    const bkId = req.user.id;
    console.log('📖 Getting all schedules for BK:', bkId);
    return await this.scheduleService.getSchedulesByBkId(bkId);
  }

  // Get schedule untuk BK saat ini dan session type tertentu
  @Get('my-schedule/:sessionType')
  async getMyScheduleByType(
    @Param('sessionType') sessionType: string,
    @Request() req,
  ) {
    const bkId = req.user.id;
    console.log(
      '📖 Getting schedule for BK:',
      bkId,
      'sessionType:',
      sessionType,
    );
    return await this.scheduleService.getScheduleByBkIdAndType(
      bkId,
      sessionType as 'tatap-muka' | 'chat',
    );
  }

  // Get available BK untuk session type tertentu
  @Get('available/:sessionType/:date/:time')
  async getAvailableBKs(
    @Param('sessionType') sessionType: string,
    @Param('date') date: string,
    @Param('time') time: string,
  ) {
    const dateObj = new Date(date);
    console.log(
      `🔍 Finding available BK for ${date} at ${time} (${sessionType})`,
    );
    const availableBKIds = await this.scheduleService.getAvailableBKs(
      dateObj,
      time,
      sessionType as 'tatap-muka' | 'chat',
    );
    return { date, time, sessionType, availableBKIds, count: availableBKIds.length };
  }

  // Check availability untuk BK tertentu dan session type
  @Get('check-availability/:bkId/:sessionType')
  async checkAvailability(
    @Param('bkId') bkId: string,
    @Param('sessionType') sessionType: string,
    @Query('date') date: string,
    @Query('time') time: string,
  ) {
    const dateObj = new Date(date);
    const isAvailable = await this.scheduleService.isAvailable(
      parseInt(bkId),
      dateObj,
      time,
      sessionType as 'tatap-muka' | 'chat',
    );
    return { bkId: parseInt(bkId), date, time, sessionType, isAvailable };
  }

  // Get schedule untuk specific BK dan session type
  @Get(':bkId/:sessionType')
  async getScheduleByBkIdAndType(
    @Param('bkId') bkId: string,
    @Param('sessionType') sessionType: string,
  ) {
    return await this.scheduleService.getScheduleByBkIdAndType(
      parseInt(bkId),
      sessionType as 'tatap-muka' | 'chat',
    );
  }

  // Update schedule untuk session type tertentu
  @Put(':sessionType')
  async updateSchedule(
    @Param('sessionType') sessionType: string,
    @Body() updateDto: UpdateBkScheduleDto,
    @Request() req,
  ) {
    const bkId = req.user.id;
    console.log('✏️ Updating BK schedule:', updateDto);
    return await this.scheduleService.update(
      bkId,
      sessionType as 'tatap-muka' | 'chat',
      updateDto,
    );
  }

  // Delete schedule untuk session type tertentu
  @Delete(':sessionType')
  async deleteSchedule(
    @Param('sessionType') sessionType: string,
    @Request() req,
  ) {
    const bkId = req.user.id;
    const success = await this.scheduleService.delete(
      bkId,
      sessionType as 'tatap-muka' | 'chat',
    );
    return { success, message: success ? 'Schedule deleted' : 'Failed to delete' };
  }
}

