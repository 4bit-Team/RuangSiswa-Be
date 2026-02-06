import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { TardinessService } from './tardiness.service';

interface AuthRequest extends Request {
  user?: any;
}

@Controller('api/v1/kesiswaan/tardiness')
export class TardinessController {
  constructor(private tardinessService: TardinessService) {}

  /**
   * GET /api/v1/kesiswaan/tardiness
   * Get paginated tardiness records with filters
   */
  @Get()
  async getTardinessRecords(
    @Query('student_id') student_id?: string,
    @Query('class_id') class_id?: string,
    @Query('status') status?: string,
    @Query('date_from') date_from?: string,
    @Query('date_to') date_to?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    try {
      const filters = {
        student_id: student_id ? parseInt(student_id) : undefined,
        class_id: class_id ? parseInt(class_id) : undefined,
        status,
        date_from,
        date_to,
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 20,
      };

      const result = await this.tardinessService.getTardinessRecords(filters);

      return {
        success: true,
        message: 'Tardiness records retrieved successfully',
        data: result.data,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          pages: Math.ceil(result.total / result.limit),
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: `Failed to retrieve tardiness records: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * POST /api/v1/kesiswaan/tardiness
   * Submit new tardiness record
   */
  @Post()
  async submitTardiness(
    @Body() dto: {
      student_id: number;
      student_name: string;
      class_id: number;
      tanggal: string;
      keterlambatan_menit: number;
      alasan?: string;
      bukti_foto?: string;
      created_by: string;
    },
  ) {
    try {
      const record = await this.tardinessService.submitTardiness(dto);

      return {
        success: true,
        message: 'Tardiness record submitted successfully',
        data: record,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: `Failed to submit tardiness: ${error.message}`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * GET /api/v1/kesiswaan/tardiness/:studentId/summary
   * Get tardiness summary for student in specific month
   *
   * Query Parameters:
   * - month (string): YYYY-MM format, defaults to current month
   */
  @Get(':studentId/summary')
  async getTardinessSummary(
    @Param('studentId') studentId: string,
    @Query('month') month?: string,
  ) {
    try {
      const summary = await this.tardinessService.getTardinessSummary(
        parseInt(studentId),
        month,
      );

      return {
        success: true,
        message: 'Tardiness summary retrieved successfully',
        data: summary,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: `Failed to retrieve summary: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /api/v1/kesiswaan/tardiness/:studentId/history
   * Get last 6 months of tardiness summary
   */
  @Get(':studentId/history')
  async getTardinessHistory(
    @Param('studentId') studentId: string,
    @Query('months') months?: string,
  ) {
    try {
      const history = await this.tardinessService.getTardinessHistory(
        parseInt(studentId),
        months ? parseInt(months) : 6,
      );

      return {
        success: true,
        message: 'Tardiness history retrieved successfully',
        data: history,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: `Failed to retrieve history: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /api/v1/kesiswaan/tardiness/:studentId/appeals
   * Get all tardiness appeals for student
   */
  @Get(':studentId/appeals')
  async getStudentAppeals(
    @Param('studentId') studentId: string,
    @Query('status') status?: string,
    @Query('is_resolved') is_resolved?: string,
  ) {
    try {
      const filters = {
        status,
        is_resolved: is_resolved === 'true' ? true : is_resolved === 'false' ? false : undefined,
      };

      const appeals = await this.tardinessService.getStudentAppeals(
        parseInt(studentId),
        filters,
      );

      return {
        success: true,
        message: 'Student appeals retrieved successfully',
        data: appeals,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: `Failed to retrieve appeals: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * POST /api/v1/kesiswaan/tardiness/:recordId/appeal
   * Student appeals a tardiness record
   */
  @Post(':recordId/appeal')
  async appealTardiness(
    @Param('recordId') recordId: string,
    @Body() dto: {
      alasan_appeal: string;
      bukti_appeal?: string;
    },
  ) {
    try {
      const appeal = await this.tardinessService.appealTardiness({
        tardiness_record_id: recordId,
        alasan_appeal: dto.alasan_appeal,
        bukti_appeal: dto.bukti_appeal,
      });

      return {
        success: true,
        message: 'Tardiness appeal submitted successfully',
        data: appeal,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: `Failed to submit appeal: ${error.message}`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * PATCH /api/v1/kesiswaan/tardiness/appeals/:appealId/review
   * BK staff reviews appeal
   */
  @Patch('appeals/:appealId/review')
  async reviewAppeal(
    @Param('appealId') appealId: string,
    @Body() dto: {
      status: 'accepted' | 'rejected';
      catatan_bk?: string;
      resolved_by: string;
    },
  ) {
    try {
      const updatedAppeal = await this.tardinessService.reviewAppeal({
        appeal_id: appealId,
        status: dto.status,
        catatan_bk: dto.catatan_bk,
        resolved_by: dto.resolved_by,
      });

      return {
        success: true,
        message: 'Appeal reviewed successfully',
        data: updatedAppeal,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: `Failed to review appeal: ${error.message}`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * POST /api/v1/kesiswaan/tardiness/sync
   * Generate tardiness alerts (scheduled job trigger)
   */
  @Post('sync')
  async generateAlerts() {
    try {
      const result = await this.tardinessService.generateTardinessAlerts();

      return {
        success: true,
        message: 'Tardiness alerts generated successfully',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: `Failed to generate alerts: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /api/v1/kesiswaan/tardiness/alerts
   * Get unresolved alerts
   */
  @Get('alerts')
  async getAlerts(
    @Query('student_id') student_id?: string,
    @Query('severity') severity?: string,
  ) {
    try {
      const filters = {
        student_id: student_id ? parseInt(student_id) : undefined,
        severity,
      };

      const alerts = await this.tardinessService.getUnresolvedAlerts(filters);

      return {
        success: true,
        message: 'Unresolved alerts retrieved successfully',
        data: alerts,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: `Failed to retrieve alerts: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * PATCH /api/v1/kesiswaan/tardiness/alerts/:alertId/resolve
   * Resolve alert (mark as handled)
   */
  @Patch('alerts/:alertId/resolve')
  async resolveAlert(
    @Param('alertId') alertId: string,
    @Body() dto: { resolved_by: string },
  ) {
    try {
      const alert = await this.tardinessService.resolveAlert(alertId, dto.resolved_by);

      return {
        success: true,
        message: 'Alert resolved successfully',
        data: alert,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: `Failed to resolve alert: ${error.message}`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * GET /api/v1/kesiswaan/tardiness/:studentId/patterns
   * Detect tardiness patterns for student
   */
  @Get(':studentId/patterns')
  async detectPatterns(@Param('studentId') studentId: string) {
    try {
      const patterns = await this.tardinessService.detectPatterns(parseInt(studentId));

      return {
        success: true,
        message: 'Tardiness patterns detected successfully',
        data: patterns,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: `Failed to detect patterns: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /api/v1/kesiswaan/tardiness/:studentId/export
   * Export tardiness report for student and month
   */
  @Get(':studentId/export')
  async exportReport(
    @Param('studentId') studentId: string,
    @Query('month') month?: string,
  ) {
    try {
      const report = await this.tardinessService.exportReport(
        parseInt(studentId),
        month || new Date().toISOString().slice(0, 7),
      );

      return {
        success: true,
        message: 'Report exported successfully',
        data: report,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: `Failed to export report: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
