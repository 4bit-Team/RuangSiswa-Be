import { Injectable, NotFoundException, BadRequestException, Logger, Inject, forwardRef, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { LaporanBk } from './entities/laporan-bk.entity';
import { Reservasi } from '../reservasi/entities/reservasi.entity';
import { CreateLaporanBkDto, UpdateLaporanBkDto, RecordSessionDto, EscalateToBkDto } from './dto/create-laporan-bk.dto';
import { NotificationService } from '../notifications/notification.service';

@Injectable()
export class LaporanBkService {
  private readonly logger = new Logger(LaporanBkService.name);

  constructor(
    @InjectRepository(LaporanBk)
    private laporanBkRepository: Repository<LaporanBk>,
    @InjectRepository(Reservasi)
    private reservasiRepository: Repository<Reservasi>,
    @Optional()
    @Inject(forwardRef(() => NotificationService))
    private notificationService?: NotificationService,
  ) {}

  // Create laporan BK from reservasi (auto-created when ringan reservasi is approved)
  async create(dto: CreateLaporanBkDto): Promise<LaporanBk> {
    // Validate reservasi exists and is 'ringan' type
    const reservasi = await this.reservasiRepository.findOne({
      where: { id: dto.reservasi_id },
    });

    if (!reservasi) {
      throw new BadRequestException(`Reservasi with ID ${dto.reservasi_id} not found`);
    }

    if (reservasi.pembinaanType !== 'ringan') {
      throw new BadRequestException('LaporanBK can only be created for "ringan" type pembinaan');
    }

    // Create report
    const laporan = this.laporanBkRepository.create({
      ...dto,
      status: 'ongoing',
      total_sessions: 0,
      parent_notified: false,
      escalated_to_waka: false,
    });

    return await this.laporanBkRepository.save(laporan);
  }

  // Get all laporan BK
  async findAll(): Promise<LaporanBk[]> {
    return await this.laporanBkRepository.find({
      relations: ['reservasi', 'pembinaan', 'bk'],
      order: { created_at: 'DESC' },
    });
  }

  // Get laporan BK for specific BK counselor
  async findByBk(bk_id: number): Promise<LaporanBk[]> {
    return await this.laporanBkRepository.find({
      where: { bk_id },
      relations: ['reservasi', 'pembinaan', 'bk'],
      order: { created_at: 'DESC' },
    });
  }

  // Get ongoing laporan BK
  async findOngoing(): Promise<LaporanBk[]> {
    return await this.laporanBkRepository.find({
      where: { status: 'ongoing' },
      relations: ['reservasi', 'pembinaan', 'bk'],
      order: { created_at: 'DESC' },
    });
  }

  // Get pending follow-up laporan
  async findPendingFollowUp(): Promise<LaporanBk[]> {
    return await this.laporanBkRepository.find({
      where: { follow_up_status: IsNull() },
      relations: ['reservasi', 'pembinaan', 'bk'],
    });
  }

  // Get single laporan
  async findOne(id: number): Promise<LaporanBk> {
    const laporan = await this.laporanBkRepository.findOne({
      where: { id },
      relations: ['reservasi', 'pembinaan', 'bk'],
    });

    if (!laporan) {
      throw new NotFoundException(`LaporanBK with ID ${id} not found`);
    }

    return laporan;
  }

  // Get laporan by reservasi ID
  async findByReservasiId(reservasi_id: number): Promise<LaporanBk | null> {
    return await this.laporanBkRepository.findOne({
      where: { reservasi_id },
      relations: ['reservasi', 'pembinaan', 'bk'],
    });
  }

  // Record a counseling session
  async recordSession(
    id: number,
    dto: RecordSessionDto,
    bk_id: number,
  ): Promise<LaporanBk> {
    const laporan = await this.findOne(id);

    // Verify BK is the one handling this laporan
    if (laporan.bk_id !== bk_id) {
      throw new BadRequestException('Only the assigned BK counselor can record sessions');
    }

    // Update session information
    laporan.session_date = new Date(dto.session_date);
    if (dto.session_duration_minutes !== undefined) {
      laporan.session_duration_minutes = dto.session_duration_minutes;
    }
    laporan.session_type = dto.session_type || 'individu';
    if (dto.session_location !== undefined) {
      laporan.session_location = dto.session_location;
    }
    laporan.session_topic = dto.session_topic;
    laporan.session_notes = dto.session_notes;

    // Update student response
    if (dto.student_response) {
      laporan.student_response = dto.student_response;
    }
    if (dto.student_understanding_level) {
      laporan.student_understanding_level = dto.student_understanding_level;
    }
    if (dto.student_participation_level) {
      laporan.student_participation_level = dto.student_participation_level;
    }

    // Update recommendations
    if (dto.recommendations) {
      laporan.recommendations = dto.recommendations;
    }

    // Set follow-up date
    if (dto.follow_up_date) {
      laporan.follow_up_date = new Date(dto.follow_up_date);
    }

    // Increment session count
    laporan.total_sessions = (laporan.total_sessions || 0) + 1;

    // Update metadata
    laporan.updated_by = bk_id;

    const updated = await this.laporanBkRepository.save(laporan);

    // Create notification for session recording
    try {
      if (this.notificationService) {
        await this.notificationService.create({
          recipient_id: laporan.student_id,
          type: 'session_recorded',
          title: 'Sesi Konseling Tercatat',
          message: `Sesi konseling BK telah dicatat. Topik: ${dto.session_topic || 'Umum'}. Silakan periksa status perkembangan Anda.`,
          related_id: laporan.id,
          related_type: 'laporan_bk',
          metadata: {
            student_id: laporan.student_id,
            bk_id: bk_id,
            session_date: dto.session_date,
            session_topic: dto.session_topic,
            total_sessions: laporan.total_sessions,
          },
        });

        this.logger.log(`✅ Notification sent: session_recorded for student ${laporan.student_id}`);
      }
    } catch (error) {
      this.logger.warn(`Failed to create session_recorded notification: ${error.message}`);
      // Don't fail the operation if notification fails
    }

    this.logger.log(`BK ${bk_id} recorded session for LaporanBK ${id}`);

    return updated;
  }

  // Mark behavioral improvement based on observations
  async markBehavioralImprovement(id: number, improved: boolean, bk_id: number): Promise<LaporanBk> {
    const laporan = await this.findOne(id);

    if (laporan.bk_id !== bk_id) {
      throw new BadRequestException('Only the assigned BK counselor can update this');
    }

    laporan.behavioral_improvement = improved;
    laporan.updated_by = bk_id;

    return await this.laporanBkRepository.save(laporan);
  }

  // Notify parents about progress
  async notifyParent(id: number, notification_content: string, bk_id: number): Promise<LaporanBk> {
    const laporan = await this.findOne(id);

    if (laporan.bk_id !== bk_id) {
      throw new BadRequestException('Only the assigned BK counselor can notify parents');
    }

    laporan.parent_notified = true;
    laporan.parent_notification_date = new Date();
    laporan.parent_notification_content = notification_content;
    laporan.updated_by = bk_id;

    this.logger.log(`Parent notified for LaporanBK ${id} by BK ${bk_id}`);

    return await this.laporanBkRepository.save(laporan);
  }

  // Complete follow-up
  async completeFollowUp(id: number, follow_up_status: string, bk_id: number): Promise<LaporanBk> {
    const laporan = await this.findOne(id);

    if (laporan.bk_id !== bk_id) {
      throw new BadRequestException('Only the assigned BK counselor can complete follow-up');
    }

    if (!laporan.follow_up_date) {
      throw new BadRequestException('No follow-up date set for this laporan');
    }

    laporan.follow_up_status = follow_up_status;
    laporan.updated_by = bk_id;

    this.logger.log(`Follow-up completed for LaporanBK ${id}: ${follow_up_status}`);

    return await this.laporanBkRepository.save(laporan);
  }

  // Escalate to WAKA if needed
  async escalateToWaka(
    id: number,
    dto: EscalateToBkDto,
    bk_id: number,
  ): Promise<LaporanBk> {
    const laporan = await this.findOne(id);

    if (laporan.bk_id !== bk_id) {
      throw new BadRequestException('Only the assigned BK counselor can escalate');
    }

    if (laporan.escalated_to_waka) {
      throw new BadRequestException('This laporan has already been escalated to WAKA');
    }

    laporan.escalated_to_waka = true;
    laporan.escalation_reason = dto.escalation_reason;
    laporan.escalation_date = new Date();
    if (dto.final_assessment !== undefined) {
      laporan.final_assessment = dto.final_assessment;
    }
    laporan.status = 'needs_escalation';
    laporan.updated_by = bk_id;

    const updated = await this.laporanBkRepository.save(laporan);

    // Create notifications for escalation
    try {
      // Notification to student
      if (this.notificationService) {
        await this.notificationService.create({
          recipient_id: laporan.student_id,
          type: 'escalation_to_waka',
          title: 'Kasus Ditingkatkan ke WAKA',
          message: `Kasus pembinaan ringan Anda telah ditingkatkan ke WAKA (Wakil Kepala Sekolah Kesiswaan). Alasan: ${dto.escalation_reason || 'Sesuai protokol'}`,
          related_id: laporan.id,
          related_type: 'laporan_bk',
          metadata: {
            student_id: laporan.student_id,
            bk_id: bk_id,
            escalation_reason: dto.escalation_reason,
            total_sessions: laporan.total_sessions,
          },
        });

        this.logger.log(`✅ Notification sent: escalation_to_waka for student ${laporan.student_id}`);
      }
    } catch (error) {
      this.logger.warn(`Failed to create escalation_to_waka notification: ${error.message}`);
      // Don't fail the operation if notification fails
    }

    this.logger.log(`LaporanBK ${id} escalated to WAKA by BK ${bk_id}. Reason: ${dto.escalation_reason}`);

    return updated;
  }

  // Complete laporan (counseling concluded successfully)
  async complete(id: number, final_assessment: string, bk_id: number): Promise<LaporanBk> {
    const laporan = await this.findOne(id);

    if (laporan.bk_id !== bk_id) {
      throw new BadRequestException('Only the assigned BK counselor can complete this');
    }

    laporan.status = 'completed';
    laporan.final_assessment = final_assessment || laporan.final_assessment;
    laporan.updated_by = bk_id;

    this.logger.log(`LaporanBK ${id} marked as completed by BK ${bk_id}`);

    return await this.laporanBkRepository.save(laporan);
  }

  // Update laporan
  async update(id: number, dto: UpdateLaporanBkDto): Promise<LaporanBk> {
    const laporan = await this.findOne(id);

    Object.assign(laporan, dto);

    return await this.laporanBkRepository.save(laporan);
  }

  // Archive laporan
  async archive(id: number): Promise<LaporanBk> {
    const laporan = await this.findOne(id);

    laporan.status = 'archived';

    return await this.laporanBkRepository.save(laporan);
  }

  // Get dashboard statistics for BK
  async getBkStatistics(bk_id: number): Promise<{
    totalLaporan: number;
    ongoing: number;
    completed: number;
    escalated: number;
    needsFollowUp: number;
    totalSessions: number;
    behavioralImprovement: number;
  }> {
    const [totalLaporan, ongoing, completed, escalated, needsFollowUp, totalSessions, behavioralImprovement] =
      await Promise.all([
        this.laporanBkRepository.count({ where: { bk_id } }),
        this.laporanBkRepository.count({ where: { bk_id, status: 'ongoing' } }),
        this.laporanBkRepository.count({ where: { bk_id, status: 'completed' } }),
        this.laporanBkRepository.count({ where: { bk_id, escalated_to_waka: true } }),
        this.laporanBkRepository.count({ where: { bk_id, follow_up_status: IsNull(), status: 'completed' } }),
        this.laporanBkRepository
          .createQueryBuilder('laporan')
          .where('laporan.bk_id = :bk_id', { bk_id })
          .select('SUM(laporan.total_sessions)', 'sum')
          .getRawOne(),
        this.laporanBkRepository.count({ where: { bk_id, behavioral_improvement: true } }),
      ]);

    return {
      totalLaporan,
      ongoing,
      completed,
      escalated,
      needsFollowUp,
      totalSessions: totalSessions?.sum || 0,
      behavioralImprovement,
    };
  }

  // Get overall statistics (admin)
  async getOverallStatistics(): Promise<{
    totalLaporan: number;
    ongoing: number;
    completed: number;
    escalated: number;
    avgSessionsPerLaporan: number;
    parentNotificationRate: number;
  }> {
    const [totalLaporan, ongoing, completed, escalated, parentNotified] = await Promise.all([
      this.laporanBkRepository.count(),
      this.laporanBkRepository.count({ where: { status: 'ongoing' } }),
      this.laporanBkRepository.count({ where: { status: 'completed' } }),
      this.laporanBkRepository.count({ where: { escalated_to_waka: true } }),
      this.laporanBkRepository.count({ where: { parent_notified: true } }),
    ]);

    const avgSessionsQueryResult = await this.laporanBkRepository
      .createQueryBuilder('laporan')
      .select('AVG(laporan.total_sessions)', 'avg')
      .getRawOne();

    return {
      totalLaporan,
      ongoing,
      completed,
      escalated,
      avgSessionsPerLaporan: parseFloat(avgSessionsQueryResult?.avg || 0).toFixed(2) as any,
      parentNotificationRate: totalLaporan > 0 ? Math.round((parentNotified / totalLaporan) * 100) : 0,
    };
  }
}

