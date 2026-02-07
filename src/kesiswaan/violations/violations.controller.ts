import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpException,
  HttpStatus,
  Logger,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import type { Response } from 'express';
import { ViolationService } from './violations.service';
import { SpPdfService } from './sp-pdf.service';
import { currentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SpLetter } from './entities/violation.entity';

@ApiTags('Kesiswaan - Violations & SP Letters')
@Controller('v1/kesiswaan')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class ViolationsController {
  private readonly logger = new Logger(ViolationsController.name);

  constructor(
    private readonly violationService: ViolationService,
    private readonly spPdfService: SpPdfService,
    @InjectRepository(SpLetter)
    private spLetterRepo: Repository<SpLetter>,
  ) {}

  /**
   * ===== VIOLATION MANAGEMENT =====
   */

  /**
   * Report new violation (Teacher/Staff)
   * POST /api/v1/kesiswaan/violations
   */
  @Post('violations')
  @ApiOperation({ summary: 'Report new violation (by teacher/staff)' })
  @ApiResponse({
    status: 201,
    description: 'Violation reported successfully. SP auto-generated if threshold reached.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async reportViolation(
    @Body() dto: any,
    @currentUser() user: any,
  ) {
    try {
      const violation = await this.violationService.reportViolation({
        ...dto,
        created_by: user.username || user.email,
      });

      // Check if SP was auto-generated
      const riskLevel = await this.violationService.getStudentRiskLevel(dto.student_id);

      return {
        success: true,
        message: 'Violation reported successfully',
        data: {
          violation,
          riskLevel,
          spTriggered: riskLevel.sp_level > 0,
        },
      };
    } catch (error) {
      this.logger.error(`Error reporting violation: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to report violation',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Get violations list with filters
   * GET /api/v1/kesiswaan/violations
   */
  @Get('violations')
  @ApiOperation({ summary: 'Get violations list with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Violations retrieved successfully' })
  async getViolations(
    @Query('student_id') student_id?: number,
    @Query('class_id') class_id?: number,
    @Query('category_id') category_id?: string,
    @Query('processed') processed?: string,
    @Query('date_from') date_from?: string,
    @Query('date_to') date_to?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    try {
      const result = await this.violationService.getViolations({
        student_id: student_id ? parseInt(student_id.toString()) : undefined,
        class_id: class_id ? parseInt(class_id.toString()) : undefined,
        category_id,
        processed: processed ? processed === 'true' : undefined,
        date_from,
        date_to,
        page: page ? parseInt(page.toString()) : 1,
        limit: limit ? parseInt(limit.toString()) : 20,
      });

      return {
        success: true,
        message: 'Violations retrieved successfully',
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          pages: Math.ceil(result.total / result.limit),
        },
      };
    } catch (error) {
      this.logger.error(`Error getting violations: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get violations',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Get student's violation history
   * GET /api/v1/kesiswaan/violations/student/:studentId
   */
  @Get('violations/student/:studentId')
  @ApiOperation({ summary: 'Get specific student violation history' })
  @ApiResponse({ status: 200, description: 'Student violations retrieved' })
  async getStudentViolations(
    @Param('studentId') studentId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    try {
      const result = await this.violationService.getViolations({
        student_id: studentId,
        page: page ? parseInt(page.toString()) : 1,
        limit: limit ? parseInt(limit.toString()) : 20,
      });

      return {
        success: true,
        message: 'Student violations retrieved',
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          pages: Math.ceil(result.total / result.limit),
        },
      };
    } catch (error) {
      this.logger.error(`Error getting student violations: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get student violations',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * ===== SP LETTER MANAGEMENT =====
   */

  /**
   * Get all SP letters with filters
   * GET /api/v1/kesiswaan/sp-letters
   */
  @Get('sp-letters')
  @ApiOperation({ summary: 'Get all SP letters with filters' })
  @ApiResponse({ status: 200, description: 'SP letters retrieved successfully' })
  async getSpLetters(
    @Query('student_id') student_id?: number,
    @Query('sp_level') sp_level?: number,
    @Query('tahun') tahun?: number,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    try {
      const result = await this.violationService.getSpLetters({
        student_id: student_id ? parseInt(student_id.toString()) : undefined,
        sp_level: sp_level ? parseInt(sp_level.toString()) : undefined,
        tahun: tahun ? parseInt(tahun.toString()) : undefined,
        status,
        page: page ? parseInt(page.toString()) : 1,
        limit: limit ? parseInt(limit.toString()) : 20,
      });

      return {
        success: true,
        message: 'SP letters retrieved successfully',
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          pages: Math.ceil(result.total / result.limit),
        },
      };
    } catch (error) {
      this.logger.error(`Error getting SP letters: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get SP letters',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Get SP progression for student
   * GET /api/v1/kesiswaan/sp-letters/progression/:studentId
   */
  @Get('sp-letters/progression/:studentId')
  @ApiOperation({ summary: 'Get SP progression status for student' })
  @ApiResponse({
    status: 200,
    description: 'Progression: SP1/SP2/SP3/Expulsion',
  })
  async getSpProgression(
    @Param('studentId') studentId: number,
    @Query('tahun') tahun?: number,
  ) {
    try {
      const progression = await this.violationService.getSpProgression(
        studentId,
        tahun ? parseInt(tahun.toString()) : undefined,
      );

      const spLetters = await this.violationService.getSpLetters({
        student_id: studentId,
        tahun: tahun ? parseInt(tahun.toString()) : undefined,
      });

      return {
        success: true,
        message: 'SP progression retrieved',
        data: {
          progression,
          spLetters: spLetters.data,
          timeline: this.buildProgressionTimeline(spLetters.data),
        },
      };
    } catch (error) {
      this.logger.error(`Error getting SP progression: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get SP progression',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * ===== VIOLATION EXCUSE/APPEAL =====
   */

  /**
   * Student submits excuse/appeal for violation
   * POST /api/v1/kesiswaan/violations/:violationId/excuse
   */
  @Post('violations/:violationId/excuse')
  @ApiOperation({
    summary: 'Student submit excuse/appeal for violation',
  })
  @ApiResponse({
    status: 201,
    description: 'Excuse submitted for review',
  })
  async submitExcuse(
    @Param('violationId') violationId: string,
    @Body() dto: any,
    @currentUser() user: any,
  ) {
    try {
      const excuse = await this.violationService.submitExcuse({
        violation_id: violationId,
        excuse_text: dto.excuse_text,
        bukti_excuse: dto.bukti_excuse,
      });

      return {
        success: true,
        message: 'Excuse submitted and pending BK review',
        data: excuse,
      };
    } catch (error) {
      this.logger.error(`Error submitting excuse: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to submit excuse',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Get excuses for review (BK Staff)
   * GET /api/v1/kesiswaan/violations/excuses
   */
  @Get('violations/excuses')
  @ApiOperation({ summary: 'Get excuses pending review (BK Staff view)' })
  @ApiResponse({ status: 200, description: 'Excuses retrieved' })
  async getExcuses(
    @Query('student_id') student_id?: number,
    @Query('status') status?: string,
    @Query('is_resolved') is_resolved?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    try {
      const result = await this.violationService.getExcuses({
        student_id: student_id ? parseInt(student_id.toString()) : undefined,
        status: status || 'pending',
        is_resolved: is_resolved ? is_resolved === 'true' : false,
        page: page ? parseInt(page.toString()) : 1,
        limit: limit ? parseInt(limit.toString()) : 20,
      });

      return {
        success: true,
        message: 'Excuses retrieved',
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          pages: Math.ceil(result.total / result.limit),
        },
      };
    } catch (error) {
      this.logger.error(`Error getting excuses: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get excuses',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * BK Staff review/decide on excuse
   * PATCH /api/v1/kesiswaan/violations/excuses/:excuseId/review
   */
  @Patch('violations/excuses/:excuseId/review')
  @ApiOperation({ summary: 'BK staff review and decide on excuse' })
  @ApiResponse({ status: 200, description: 'Excuse reviewed' })
  async reviewExcuse(
    @Param('excuseId') excuseId: string,
    @Body() dto: any,
    @currentUser() user: any,
  ) {
    try {
      const excuse = await this.violationService.reviewExcuse({
        excuse_id: excuseId,
        status: dto.status, // 'accepted' or 'rejected'
        catatan_bk: dto.catatan_bk,
        resolved_by: user.username || user.email,
      });

      return {
        success: true,
        message: `Excuse ${dto.status}`,
        data: excuse,
      };
    } catch (error) {
      this.logger.error(`Error reviewing excuse: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to review excuse',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * ===== RISK ASSESSMENT & STATISTICS =====
   */

  /**
   * Get student risk level
   * GET /api/v1/kesiswaan/violations/risk/:studentId
   */
  @Get('violations/risk/:studentId')
  @ApiOperation({
    summary: 'Get student risk level (green/yellow/orange/red)',
  })
  @ApiResponse({ status: 200, description: 'Risk assessment retrieved' })
  async getStudentRiskLevel(
    @Param('studentId') studentId: number,
    @Query('tahun') tahun?: number,
  ) {
    try {
      const riskLevel = await this.violationService.getStudentRiskLevel(
        studentId,
        tahun ? parseInt(tahun.toString()) : undefined,
      );

      return {
        success: true,
        message: 'Risk level assessed',
        data: riskLevel,
      };
    } catch (error) {
      this.logger.error(`Error getting risk level: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get risk level',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Export violation report for student
   * GET /api/v1/kesiswaan/violations/report/:studentId/export
   */
  @Get('violations/report/:studentId/export')
  @ApiOperation({ summary: 'Export student violation report' })
  @ApiResponse({ status: 200, description: 'Report exported' })
  async exportReport(
    @Param('studentId') studentId: number,
    @Query('tahun') tahun?: number,
  ) {
    try {
      const report = await this.violationService.exportReport(
        studentId,
        tahun ? parseInt(tahun.toString()) : undefined,
      );

      return {
        success: true,
        message: 'Report exported',
        data: report,
      };
    } catch (error) {
      this.logger.error(`Error exporting report: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to export report',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * ===== SP LETTER SIGNING =====
   */

  /**
   * Sign SP letter (Parent/Guardian)
   * PATCH /api/v1/kesiswaan/sp-letters/:spLetterId/sign
   */
  @Patch('sp-letters/:spLetterId/sign')
  @ApiOperation({ summary: 'Sign SP letter (parent/guardian)' })
  @ApiResponse({ status: 200, description: 'SP letter signed' })
  async signSpLetter(
    @Param('spLetterId') spLetterId: string,
    @Body() dto: any,
    @currentUser() user: any,
  ) {
    try {
      const spLetter = await this.violationService.signSpLetter(
        spLetterId,
        dto.signed_by_parent || user.name,
      );

      return {
        success: true,
        message: 'SP letter signed successfully',
        data: spLetter,
      };
    } catch (error) {
      this.logger.error(`Error signing SP letter: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to sign SP letter',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * ===== PDF GENERATION & EXPORT =====
   */

  /**
   * Export SP letter as PDF
   * POST /api/v1/kesiswaan/sp-letters/:spLetterId/export-pdf
   */
  @Post('sp-letters/:spLetterId/export-pdf')
  @ApiOperation({ summary: 'Generate and export SP letter as PDF' })
  @ApiResponse({
    status: 200,
    description: 'PDF generated and returned',
  })
  async exportSpPdf(
    @Param('spLetterId') spLetterId: string,
    @Res() res: Response,
  ) {
    try {
      // Fetch SP letter
      const spLetter = await this.spLetterRepo.findOne({
        where: { id: spLetterId },
      });

      if (!spLetter) {
        throw new HttpException('SP Letter not found', HttpStatus.NOT_FOUND);
      }

      // Generate PDF buffer
      const pdfBuffer = await this.spPdfService.generateSpPdfBuffer(spLetter);

      // Return PDF
      res.contentType('application/pdf');
      res.header('Content-Disposition', `attachment; filename="${spLetter.sp_number.replace(/\//g, '-')}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      this.logger.error(`Error exporting PDF: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to export PDF',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * ===== HELPER METHODS =====
   */

  private buildProgressionTimeline(spLetters: any[]): any[] {
    return spLetters
      .sort((a, b) => new Date(a.tanggal_sp).getTime() - new Date(b.tanggal_sp).getTime())
      .map((sp) => ({
        sp_level: sp.sp_level,
        sp_number: sp.sp_number,
        tanggal_sp: sp.tanggal_sp,
        status: sp.status,
        is_signed: sp.is_signed,
        consequences: sp.consequences,
      }));
  }
}
