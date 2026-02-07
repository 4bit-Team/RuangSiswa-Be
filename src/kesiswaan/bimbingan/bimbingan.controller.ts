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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BimbinganService } from './bimbingan.service';
import { currentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Kesiswaan - Bimbingan/Guidance')
@Controller('v1/kesiswaan/bimbingan')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class BimbinganController {
  private readonly logger = new Logger(BimbinganController.name);

  constructor(private readonly bimbinganService: BimbinganService) {}

  /**
   * ===== REFERRAL MANAGEMENT =====
   */

  /**
   * Create/submit guidance referral
   * POST /api/v1/kesiswaan/bimbingan/referrals
   */
  @Post('referrals')
  @ApiOperation({ summary: 'Create guidance referral (auto or manual)' })
  @ApiResponse({
    status: 201,
    description: 'Referral created. Can be auto-triggered from violations/attendance or manual.',
  })
  async createReferral(
    @Body() dto: any,
    @currentUser() user: any,
  ) {
    try {
      const referral = await this.bimbinganService.createReferral({
        student_id: dto.student_id,
        student_name: dto.student_name,
        class_id: dto.class_id,
        tahun: dto.tahun || new Date().getFullYear(),
        referral_reason: dto.referral_reason,
        risk_level: dto.risk_level || 'yellow',
        referral_source: dto.referral_source,
        notes: dto.notes,
      });

      return {
        success: true,
        message: 'Referral created successfully',
        data: referral,
      };
    } catch (error) {
      this.logger.error(`Error creating referral: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to create referral',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Get referrals list with filters
   * GET /api/v1/kesiswaan/bimbingan/referrals
   */
  @Get('referrals')
  @ApiOperation({ summary: 'Get referrals list with filters' })
  @ApiResponse({ status: 200, description: 'Referrals retrieved' })
  async getReferrals(
    @Query('student_id') student_id?: number,
    @Query('counselor_id') counselor_id?: string,
    @Query('status') status?: string,
    @Query('risk_level') risk_level?: string,
    @Query('tahun') tahun?: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    try {
      const result = await this.bimbinganService.getReferrals({
        student_id: student_id ? parseInt(student_id.toString()) : undefined,
        counselor_id,
        status,
        risk_level,
        tahun: tahun ? parseInt(tahun.toString()) : undefined,
        page: page ? parseInt(page.toString()) : 1,
        limit: limit ? parseInt(limit.toString()) : 20,
      });

      return {
        success: true,
        message: 'Referrals retrieved',
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          pages: Math.ceil(result.total / result.limit),
        },
      };
    } catch (error) {
      this.logger.error(`Error getting referrals: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get referrals',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Assign counselor to referral
   * PATCH /api/v1/kesiswaan/bimbingan/referrals/:referralId/assign
   */
  @Patch('referrals/:referralId/assign')
  @ApiOperation({ summary: 'Assign BK counselor to referral' })
  @ApiResponse({ status: 200, description: 'Counselor assigned' })
  async assignCounselor(
    @Param('referralId') referralId: string,
    @Body() dto: any,
    @currentUser() user: any,
  ) {
    try {
      const referral = await this.bimbinganService.assignCounselor(
        referralId,
        dto.counselor_id || user.id,
        dto.counselor_name || user.name,
      );

      return {
        success: true,
        message: 'Counselor assigned successfully',
        data: referral,
      };
    } catch (error) {
      this.logger.error(`Error assigning counselor: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to assign counselor',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * ===== SESSION MANAGEMENT =====
   */

  /**
   * Create guidance session
   * POST /api/v1/kesiswaan/bimbingan/sesi
   */
  @Post('sesi')
  @ApiOperation({ summary: 'Schedule new guidance session' })
  @ApiResponse({ status: 201, description: 'Session scheduled' })
  async createSesi(
    @Body() dto: any,
    @currentUser() user: any,
  ) {
    try {
      const sesi = await this.bimbinganService.createSesi({
        referral_id: dto.referral_id,
        student_id: dto.student_id,
        student_name: dto.student_name,
        counselor_id: dto.counselor_id || user.id,
        counselor_name: dto.counselor_name || user.name,
        tanggal_sesi: dto.tanggal_sesi,
        jam_sesi: dto.jam_sesi,
        topik_pembahasan: dto.topik_pembahasan,
        lokasi: dto.lokasi,
      });

      return {
        success: true,
        message: 'Session scheduled successfully',
        data: sesi,
      };
    } catch (error) {
      this.logger.error(`Error creating session: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to create session',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Get sessions list
   * GET /api/v1/kesiswaan/bimbingan/sesi
   */
  @Get('sesi')
  @ApiOperation({ summary: 'Get guidance sessions list' })
  @ApiResponse({ status: 200, description: 'Sessions retrieved' })
  async getSesi(
    @Query('referral_id') referral_id?: string,
    @Query('student_id') student_id?: number,
    @Query('counselor_id') counselor_id?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    try {
      const result = await this.bimbinganService.getSesi({
        referral_id,
        student_id: student_id ? parseInt(student_id.toString()) : undefined,
        counselor_id,
        status,
        page: page ? parseInt(page.toString()) : 1,
        limit: limit ? parseInt(limit.toString()) : 20,
      });

      return {
        success: true,
        message: 'Sessions retrieved',
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          pages: Math.ceil(result.total / result.limit),
        },
      };
    } catch (error) {
      this.logger.error(`Error getting sessions: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get sessions',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Complete session
   * PATCH /api/v1/kesiswaan/bimbingan/sesi/:sesiId/complete
   */
  @Patch('sesi/:sesiId/complete')
  @ApiOperation({ summary: 'Mark session as completed' })
  @ApiResponse({ status: 200, description: 'Session completed' })
  async completeSesi(
    @Param('sesiId') sesiId: string,
    @Body() dto: any,
  ) {
    try {
      const sesi = await this.bimbinganService.completeSesi(
        sesiId,
        dto.siswa_hadir || false,
        dto.orang_tua_hadir || false,
        dto.hasil_akhir,
        dto.follow_up_status,
        dto.follow_up_date,
      );

      return {
        success: true,
        message: 'Session marked as completed',
        data: sesi,
      };
    } catch (error) {
      this.logger.error(`Error completing session: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to complete session',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * ===== CASE NOTES =====
   */

  /**
   * Add case note
   * POST /api/v1/kesiswaan/bimbingan/catat
   */
  @Post('catat')
  @ApiOperation({ summary: 'Add case note/observation' })
  @ApiResponse({ status: 201, description: 'Case note added' })
  async addCatat(
    @Body() dto: any,
    @currentUser() user: any,
  ) {
    try {
      const catat = await this.bimbinganService.addCatat({
        referral_id: dto.referral_id,
        student_id: dto.student_id,
        student_name: dto.student_name,
        counselor_id: dto.counselor_id || user.id,
        counselor_name: dto.counselor_name || user.name,
        jenis_catat: dto.jenis_catat,
        isi_catat: dto.isi_catat,
        tanggal_catat: dto.tanggal_catat || new Date().toISOString().split('T')[0],
        memerlukan_tindakan: dto.memerlukan_tindakan,
        tindakan_lanjutan: dto.tindakan_lanjutan,
      });

      return {
        success: true,
        message: 'Case note added',
        data: catat,
      };
    } catch (error) {
      this.logger.error(`Error adding case note: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to add case note',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Get case notes
   * GET /api/v1/kesiswaan/bimbingan/catat
   */
  @Get('catat')
  @ApiOperation({ summary: 'Get case notes' })
  @ApiResponse({ status: 200, description: 'Case notes retrieved' })
  async getCatat(
    @Query('referral_id') referral_id?: string,
    @Query('student_id') student_id?: number,
    @Query('counselor_id') counselor_id?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    try {
      const result = await this.bimbinganService.getCatat({
        referral_id,
        student_id: student_id ? parseInt(student_id.toString()) : undefined,
        counselor_id,
        page: page ? parseInt(page.toString()) : 1,
        limit: limit ? parseInt(limit.toString()) : 20,
      });

      return {
        success: true,
        message: 'Case notes retrieved',
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          pages: Math.ceil(result.total / result.limit),
        },
      };
    } catch (error) {
      this.logger.error(`Error getting case notes: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get case notes',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * ===== INTERVENTIONS =====
   */

  /**
   * Create intervention
   * POST /api/v1/kesiswaan/bimbingan/intervensi
   */
  @Post('intervensi')
  @ApiOperation({ summary: 'Create/log intervention' })
  @ApiResponse({ status: 201, description: 'Intervention created' })
  async createIntervensi(
    @Body() dto: any,
    @currentUser() user: any,
  ) {
    try {
      const intervensi = await this.bimbinganService.createIntervensi({
        referral_id: dto.referral_id,
        student_id: dto.student_id,
        student_name: dto.student_name,
        counselor_id: dto.counselor_id || user.id,
        counselor_name: dto.counselor_name || user.name,
        jenis_intervensi: dto.jenis_intervensi,
        deskripsi_intervensi: dto.deskripsi_intervensi,
        tanggal_intervensi: dto.tanggal_intervensi || new Date().toISOString().split('T')[0],
      });

      return {
        success: true,
        message: 'Intervention created',
        data: intervensi,
      };
    } catch (error) {
      this.logger.error(`Error creating intervention: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to create intervention',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Get interventions
   * GET /api/v1/kesiswaan/bimbingan/intervensi
   */
  @Get('intervensi')
  @ApiOperation({ summary: 'Get interventions list' })
  @ApiResponse({ status: 200, description: 'Interventions retrieved' })
  async getIntervensi(
    @Query('referral_id') referral_id?: string,
    @Query('student_id') student_id?: number,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    try {
      const result = await this.bimbinganService.getIntervensi({
        referral_id,
        student_id: student_id ? parseInt(student_id.toString()) : undefined,
        status,
        page: page ? parseInt(page.toString()) : 1,
        limit: limit ? parseInt(limit.toString()) : 20,
      });

      return {
        success: true,
        message: 'Interventions retrieved',
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          pages: Math.ceil(result.total / result.limit),
        },
      };
    } catch (error) {
      this.logger.error(`Error getting interventions: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get interventions',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Evaluate intervention
   * PATCH /api/v1/kesiswaan/bimbingan/intervensi/:intervensiId/evaluate
   */
  @Patch('intervensi/:intervensiId/evaluate')
  @ApiOperation({ summary: 'Evaluate intervention effectiveness' })
  @ApiResponse({ status: 200, description: 'Intervention evaluated' })
  async evaluateIntervensi(
    @Param('intervensiId') intervensiId: string,
    @Body() dto: any,
  ) {
    try {
      const intervensi = await this.bimbinganService.evaluateIntervensi(
        intervensiId,
        dto.hasil_intervensi,
        dto.efektivitas, // very effective, effective, less effective, not effective
      );

      return {
        success: true,
        message: 'Intervention evaluated',
        data: intervensi,
      };
    } catch (error) {
      this.logger.error(`Error evaluating intervention: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to evaluate intervention',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * ===== PROGRESS TRACKING =====
   */

  /**
   * Record progress evaluation
   * POST /api/v1/kesiswaan/bimbingan/perkembangan
   */
  @Post('perkembangan')
  @ApiOperation({ summary: 'Record student progress/development' })
  @ApiResponse({ status: 201, description: 'Progress recorded' })
  async recordPerkembangan(
    @Body() dto: any,
    @currentUser() user: any,
  ) {
    try {
      const perkembangan = await this.bimbinganService.recordPerkembangan(
        dto.referral_id,
        dto.student_id,
        dto.student_name,
        dto.counselor_id || user.id,
        {
          perilaku_skor: dto.perilaku_skor,
          perilaku_catatan: dto.perilaku_catatan,
          akademik_skor: dto.akademik_skor,
          akademik_catatan: dto.akademik_catatan,
          emosi_skor: dto.emosi_skor,
          emosi_catatan: dto.emosi_catatan,
          kehadiran_skor: dto.kehadiran_skor,
          kehadiran_catatan: dto.kehadiran_catatan,
          sesi_total_dijalankan: dto.sesi_total_dijalankan,
        },
      );

      return {
        success: true,
        message: 'Progress recorded',
        data: perkembangan,
      };
    } catch (error) {
      this.logger.error(`Error recording progress: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to record progress',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Get progress records
   * GET /api/v1/kesiswaan/bimbingan/perkembangan
   */
  @Get('perkembangan')
  @ApiOperation({ summary: 'Get progress records' })
  @ApiResponse({ status: 200, description: 'Progress records retrieved' })
  async getPerkembangan(
    @Query('referral_id') referral_id?: string,
    @Query('student_id') student_id?: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    try {
      const result = await this.bimbinganService.getPerkembangan({
        referral_id,
        student_id: student_id ? parseInt(student_id.toString()) : undefined,
        page: page ? parseInt(page.toString()) : 1,
        limit: limit ? parseInt(limit.toString()) : 20,
      });

      return {
        success: true,
        message: 'Progress records retrieved',
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          pages: Math.ceil(result.total / result.limit),
        },
      };
    } catch (error) {
      this.logger.error(`Error getting progress records: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get progress records',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * ===== GOALS/TARGETS =====
   */

  /**
   * Create guidance goal
   * POST /api/v1/kesiswaan/bimbingan/target
   */
  @Post('target')
  @ApiOperation({ summary: 'Set guidance goal/target' })
  @ApiResponse({ status: 201, description: 'Target created' })
  async createTarget(
    @Body() dto: any,
    @currentUser() user: any,
  ) {
    try {
      const target = await this.bimbinganService.createTarget({
        referral_id: dto.referral_id,
        student_id: dto.student_id,
        student_name: dto.student_name,
        counselor_id: dto.counselor_id || user.id,
        area_target: dto.area_target,
        target_spesifik: dto.target_spesifik,
        tanggal_mulai: dto.tanggal_mulai || new Date().toISOString().split('T')[0],
        tanggal_target: dto.tanggal_target,
        strategi_pencapaian: dto.strategi_pencapaian,
      });

      return {
        success: true,
        message: 'Target created',
        data: target,
      };
    } catch (error) {
      this.logger.error(`Error creating target: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to create target',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Get targets
   * GET /api/v1/kesiswaan/bimbingan/target
   */
  @Get('target')
  @ApiOperation({ summary: 'Get guidance targets/goals' })
  @ApiResponse({ status: 200, description: 'Targets retrieved' })
  async getTarget(
    @Query('referral_id') referral_id?: string,
    @Query('student_id') student_id?: number,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    try {
      const result = await this.bimbinganService.getTarget({
        referral_id,
        student_id: student_id ? parseInt(student_id.toString()) : undefined,
        status,
        page: page ? parseInt(page.toString()) : 1,
        limit: limit ? parseInt(limit.toString()) : 20,
      });

      return {
        success: true,
        message: 'Targets retrieved',
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          pages: Math.ceil(result.total / result.limit),
        },
      };
    } catch (error) {
      this.logger.error(`Error getting targets: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get targets',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * ===== STATUS & DASHBOARD =====
   */

  /**
   * Get student guidance status
   * GET /api/v1/kesiswaan/bimbingan/status/:studentId
   */
  @Get('status/:studentId')
  @ApiOperation({ summary: 'Get student guidance status summary' })
  @ApiResponse({ status: 200, description: 'Status retrieved' })
  async getStudentStatus(
    @Param('studentId') studentId: number,
    @Query('tahun') tahun?: number,
  ) {
    try {
      const status = await this.bimbinganService.getStudentStatus(
        studentId,
        tahun ? parseInt(tahun.toString()) : undefined,
      );

      return {
        success: true,
        message: 'Status retrieved',
        data: status,
      };
    } catch (error) {
      this.logger.error(`Error getting student status: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get student status',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
