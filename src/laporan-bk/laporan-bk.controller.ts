import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { LaporanBkService } from './laporan-bk.service';
import {
  CreateLaporanBkDto,
  UpdateLaporanBkDto,
  RecordSessionDto,
  EscalateToBkDto,
  CompleteFollowUpDto,
} from './dto/create-laporan-bk.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('laporan-bk')
@UseGuards(JwtAuthGuard)
export class LaporanBkController {
  constructor(private readonly laporanBkService: LaporanBkService) {}

  // Create laporan BK (auto-created when ringan reservasi is approved)
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('bk', 'admin')
  async create(@Body() createDto: CreateLaporanBkDto) {
    return await this.laporanBkService.create(createDto);
  }

  // Get all laporan BK (admin & kesiswaan)
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'kesiswaan')
  async findAll() {
    return await this.laporanBkService.findAll();
  }

  // Get laporan for current BK
  @Get('my-laporan')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('bk')
  async getMyLaporan(@Request() req) {
    const bk_id = req.user.id;
    return await this.laporanBkService.findByBk(bk_id);
  }

  // Get ongoing laporan
  @Get('status/ongoing')
  async getOngoing() {
    return await this.laporanBkService.findOngoing();
  }

  // Get pending follow-up
  @Get('follow-up/pending')
  async getPendingFollowUp() {
    return await this.laporanBkService.findPendingFollowUp();
  }

  // Get BK statistics
  @Get('statistics/bk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('bk', 'admin')
  async getBkStatistics(@Request() req) {
    const bk_id = req.user.id;
    return await this.laporanBkService.getBkStatistics(bk_id);
  }

  // Get overall statistics (admin)
  @Get('statistics/overall')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getOverallStatistics() {
    return await this.laporanBkService.getOverallStatistics();
  }

  // Get laporan by reservasi ID
  @Get('by-reservasi/:reservasiId')
  async getByReservasiId(@Param('reservasiId') reservasiId: string) {
    const laporan = await this.laporanBkService.findByReservasiId(parseInt(reservasiId));
    if (!laporan) {
      throw new NotFoundException(`No laporan found for reservasi ID ${reservasiId}`);
    }
    return laporan;
  }

  // Get single laporan
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.laporanBkService.findOne(parseInt(id));
  }

  // Record a counseling session
  @Patch(':id/session')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('bk')
  async recordSession(
    @Param('id') id: string,
    @Body() recordSessionDto: RecordSessionDto,
    @Request() req,
  ) {
    const bk_id = req.user.id;
    return await this.laporanBkService.recordSession(parseInt(id), recordSessionDto, bk_id);
  }

  // Mark behavioral improvement
  @Patch(':id/behavioral-improvement')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('bk')
  async markBehavioralImprovement(
    @Param('id') id: string,
    @Body() body: { improved: boolean },
    @Request() req,
  ) {
    const bk_id = req.user.id;
    return await this.laporanBkService.markBehavioralImprovement(parseInt(id), body.improved, bk_id);
  }

  // Notify parents
  @Patch(':id/notify-parent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('bk')
  async notifyParent(
    @Param('id') id: string,
    @Body() body: { notification_content: string },
    @Request() req,
  ) {
    const bk_id = req.user.id;
    return await this.laporanBkService.notifyParent(parseInt(id), body.notification_content, bk_id);
  }

  // Complete follow-up
  @Patch(':id/follow-up/complete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('bk')
  async completeFollowUp(
    @Param('id') id: string,
    @Body() completeDto: CompleteFollowUpDto,
    @Request() req,
  ) {
    const bk_id = req.user.id;
    return await this.laporanBkService.completeFollowUp(parseInt(id), completeDto.follow_up_status, bk_id);
  }

  // Escalate to WAKA
  @Patch(':id/escalate-to-waka')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('bk')
  async escalateToWaka(
    @Param('id') id: string,
    @Body() escalateDto: EscalateToBkDto,
    @Request() req,
  ) {
    const bk_id = req.user.id;
    return await this.laporanBkService.escalateToWaka(parseInt(id), escalateDto, bk_id);
  }

  // Complete laporan
  @Patch(':id/complete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('bk')
  async complete(
    @Param('id') id: string,
    @Body() body: { final_assessment: string },
    @Request() req,
  ) {
    const bk_id = req.user.id;
    return await this.laporanBkService.complete(parseInt(id), body.final_assessment, bk_id);
  }

  // Update laporan
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('bk', 'admin')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateLaporanBkDto,
  ) {
    return await this.laporanBkService.update(parseInt(id), updateDto);
  }

  // Archive laporan
  @Patch(':id/archive')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('bk', 'admin')
  async archive(@Param('id') id: string) {
    return await this.laporanBkService.archive(parseInt(id));
  }
}
