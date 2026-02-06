import {
  Controller,
  Get,
  Query,
  Param,
  Post,
  Patch,
  Body,
  HttpCode,
  Logger,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';

/**
 * AttendanceController
 * Endpoints untuk fitur Kehadiran di RuangSiswa Kesiswaan
 * Base Path: /api/v1/kesiswaan/attendance
 */
@Controller('api/v1/kesiswaan/attendance')
export class AttendanceController {
  private readonly logger = new Logger(AttendanceController.name);

  constructor(private attendanceService: AttendanceService) {}

  /**
   * GET /attendance
   * Get attendance records dengan filter
   */
  @Get()
  async index(
    @Query('student_id') studentId?: number,
    @Query('class_id') classId?: number,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    try {
      const filters = {
        student_id: studentId,
        class_id: classId,
        start_date: startDate ? new Date(startDate) : undefined,
        end_date: endDate ? new Date(endDate) : undefined,
        page,
        limit,
      };

      const result = await this.attendanceService.getAttendanceRecords(filters);

      return {
        success: true,
        message: 'Attendance records retrieved successfully',
        data: result.data,
        pagination: result.pagination,
      };
    } catch (error) {
      this.logger.error(`Error fetching attendance: ${error.message}`);
      return {
        success: false,
        message: 'Failed to retrieve attendance records',
        error: error.message,
      };
    }
  }

  /**
   * GET /attendance/:studentId/summary
   * Get monthly attendance summary
   */
  @Get(':studentId/summary')
  async summary(
    @Param('studentId') studentId: number,
    @Query('month') month: string,
  ) {
    try {
      const summary = await this.attendanceService.getAttendanceSummary(
        studentId,
        month,
      );

      return {
        success: true,
        message: 'Attendance summary retrieved successfully',
        data: summary,
      };
    } catch (error) {
      this.logger.error(`Error fetching summary: ${error.message}`);
      return {
        success: false,
        message: 'Failed to retrieve attendance summary',
        error: error.message,
      };
    }
  }

  /**
   * GET /attendance/:studentId/history
   * Get last 6 months attendance summary
   */
  @Get(':studentId/history')
  async history(@Param('studentId') studentId: number) {
    try {
      const histories: any[] = [];
      const now = new Date();

      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const month = date.toISOString().slice(0, 7); // "2025-01"

        const summary = await this.attendanceService.getAttendanceSummary(
          studentId,
          month,
        );
        histories.push(summary);
      }

      return {
        success: true,
        message: 'Attendance history retrieved successfully',
        data: histories,
      };
    } catch (error) {
      this.logger.error(`Error fetching history: ${error.message}`);
      return {
        success: false,
        message: 'Failed to retrieve attendance history',
        error: error.message,
      };
    }
  }

  /**
   * POST /attendance/sync
   * Trigger sync dari Walas
   */
  @Post('sync')
  @HttpCode(200)
  async sync(
    @Body() body: { start_date: string; end_date: string; force_sync?: boolean },
  ) {
    try {
      const result = await this.attendanceService.syncAttendanceFromWalas(
        new Date(body.start_date),
        new Date(body.end_date),
        body.force_sync || false,
      );

      return {
        success: result.success,
        message: result.success
          ? 'Sync completed successfully'
          : 'Sync completed with errors',
        data: result,
      };
    } catch (error) {
      this.logger.error(`Error during sync: ${error.message}`);
      return {
        success: false,
        message: 'Failed to sync attendance',
        error: error.message,
      };
    }
  }

  /**
   * GET /attendance/export/pdf
   * Export to PDF
   */
  @Get('export/pdf')
  async exportPdf(
    @Query('student_id') studentId: number,
    @Query('month') month: string,
  ) {
    try {
      const buffer = await this.attendanceService.exportAttendance(
        studentId,
        month,
        'pdf',
      );

      return {
        success: true,
        message: 'PDF exported successfully',
        data: buffer.toString('base64'),
      };
    } catch (error) {
      this.logger.error(`Error exporting PDF: ${error.message}`);
      return {
        success: false,
        message: 'Failed to export PDF',
        error: error.message,
      };
    }
  }

  /**
   * GET /attendance/export/excel
   * Export to Excel
   */
  @Get('export/excel')
  async exportExcel(
    @Query('class_id') classId: number,
    @Query('month') month: string,
  ) {
    try {
      // TODO: Implement class-based export
      return {
        success: false,
        message: 'Feature not yet implemented',
      };
    } catch (error) {
      this.logger.error(`Error exporting Excel: ${error.message}`);
      return {
        success: false,
        message: 'Failed to export Excel',
        error: error.message,
      };
    }
  }

  /**
   * GET /attendance/alerts
   * Get attendance alerts
   */
  @Get('alerts')
  async getAlerts(
    @Query('student_id') studentId?: number,
    @Query('severity') severity?: string,
    @Query('resolved') resolved = false,
  ) {
    try {
      // TODO: Implement alert retrieval
      return {
        success: true,
        message: 'Alerts retrieved successfully',
        data: [],
      };
    } catch (error) {
      this.logger.error(`Error fetching alerts: ${error.message}`);
      return {
        success: false,
        message: 'Failed to retrieve alerts',
        error: error.message,
      };
    }
  }

  /**
   * POST /attendance/alerts/:alertId/resolve
   * Resolve alert
   */
  @Patch('alerts/:alertId/resolve')
  async resolveAlert(
    @Param('alertId') alertId: number,
    @Body() body: { notes: string },
  ) {
    try {
      // TODO: Implement alert resolution
      return {
        success: true,
        message: 'Alert resolved successfully',
      };
    } catch (error) {
      this.logger.error(`Error resolving alert: ${error.message}`);
      return {
        success: false,
        message: 'Failed to resolve alert',
        error: error.message,
      };
    }
  }
}
