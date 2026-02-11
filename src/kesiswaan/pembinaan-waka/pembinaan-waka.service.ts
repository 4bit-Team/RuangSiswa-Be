import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger, Inject, forwardRef, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PembinaanWaka } from './entities/pembinaan-waka.entity';
import { Reservasi } from '../../reservasi/entities/reservasi.entity';
import {
  CreatePembinaanWakaDto,
  DecidePembinaanWakaDto,
  AcknowledgePembinaanWakaDto,
  AppealPembinaanWakaDto,
  UpdatePembinaanWakaDto,
} from './dto/create-pembinaan-waka.dto';
import { NotificationService } from '../../notifications/notification.service';

@Injectable()
export class PembinaanWakaService {
  private readonly logger = new Logger(PembinaanWakaService.name);

  constructor(
    @InjectRepository(PembinaanWaka)
    private pembinaanWakaRepository: Repository<PembinaanWaka>,
    @InjectRepository(Reservasi)
    private reservasiRepository: Repository<Reservasi>,
    @Optional()
    @Inject(forwardRef(() => NotificationService))
    private notificationService?: NotificationService,
  ) {}

  // Create pembinaan waka record when a 'berat' reservasi is created
  async create(dto: CreatePembinaanWakaDto): Promise<PembinaanWaka> {
    // Validate reservasi exists and is 'berat' type
    const reservasi = await this.reservasiRepository.findOne({
      where: { id: dto.reservasi_id },
    });

    if (!reservasi) {
      throw new BadRequestException(`Reservasi with ID ${dto.reservasi_id} not found`);
    }

    if (reservasi.pembinaanType !== 'berat') {
      throw new BadRequestException('PembinaanWaka can only be created for "berat" type pembinaan');
    }

    // Create pembinaan waka record
    const pembinaanWaka = this.pembinaanWakaRepository.create({
      reservasi_id: dto.reservasi_id,
      pembinaan_id: dto.pembinaan_id,
      waka_id: dto.waka_id,
      status: 'pending',
      created_by: dto.waka_id,
    });

    return await this.pembinaanWakaRepository.save(pembinaanWaka);
  }

  // Get all pembinaan waka records
  async findAll(): Promise<PembinaanWaka[]> {
    return await this.pembinaanWakaRepository.find({
      relations: ['reservasi', 'pembinaan', 'waka'],
    });
  }

  // Get pending pembinaan waka (for WAKA dashboard)
  async getPendingForWaka(waka_id: number): Promise<PembinaanWaka[]> {
    return await this.pembinaanWakaRepository.find({
      where: {
        waka_id,
        status: 'pending',
      },
      relations: ['reservasi', 'pembinaan', 'waka'],
    });
  }

  // Get single pembinaan waka
  async findOne(id: number): Promise<PembinaanWaka> {
    const pembinaanWaka = await this.pembinaanWakaRepository.findOne({
      where: { id },
      relations: ['reservasi', 'pembinaan', 'waka'],
    });

    if (!pembinaanWaka) {
      throw new NotFoundException(`PembinaanWaka with ID ${id} not found`);
    }

    return pembinaanWaka;
  }

  // WAKA decides SP3 or DO
  async makeDecision(id: number, dto: DecidePembinaanWakaDto, waka_id: number): Promise<PembinaanWaka> {
    const pembinaanWaka = await this.findOne(id);

    // Verify WAKA is the assigned one
    if (pembinaanWaka.waka_id !== waka_id) {
      throw new ForbiddenException('Only the assigned WAKA can make this decision');
    }

    // Only can decide if status is 'pending' or 'in_review'
    if (!['pending', 'in_review'].includes(pembinaanWaka.status)) {
      throw new BadRequestException(
        `Cannot make decision. Current status is ${pembinaanWaka.status}. Decision can only be made from 'pending' or 'in_review' status.`,
      );
    }

    // Update decision
    pembinaanWaka.wak_decision = dto.wak_decision;
    pembinaanWaka.decision_reason = dto.decision_reason ?? null;
    pembinaanWaka.notes = dto.notes ?? null;
    pembinaanWaka.status = 'decided';
    pembinaanWaka.decision_date = new Date();
    pembinaanWaka.updated_by = waka_id;

    const updated = await this.pembinaanWakaRepository.save(pembinaanWaka);

    // Get reservasi info for notification
    try {
      const reservasi = await this.reservasiRepository.findOne({
        where: { id: pembinaanWaka.reservasi_id },
      });

      if (reservasi) {
        const decisionText = (dto.wak_decision as string) === 'SP3' ? 'Surat Peringatan III' : 'Surat Dikecam (Skorsing)';

        // Create notification for student
        if (this.notificationService) {
          await this.notificationService.create({
            recipient_id: reservasi.studentId,
            type: 'decision_made',
            title: `Keputusan WAKA: ${decisionText}`,
            message: `WAKA telah membuat keputusan terkait kasus Anda: ${decisionText}. ${dto.decision_reason ? `Alasan: ${dto.decision_reason}` : ''}`,
            related_id: pembinaanWaka.id,
            related_type: 'pembinaan_waka',
            metadata: {
              student_id: reservasi.studentId,
              waka_id: waka_id,
              decision: dto.wak_decision,
              decision_reason: dto.decision_reason,
              decision_date: new Date().toISOString(),
            },
          });

          this.logger.log(`Notification sent: decision_made for student ${reservasi.studentId}`);
        }
      }
    } catch (error) {
      this.logger.warn(`Failed to create decision_made notification: ${error.message}`);
      // Don't fail the operation if notification fails
    }

    this.logger.log(
      `WAKA ${waka_id} decided ${dto.wak_decision} for PembinaanWaka ${id}. Reason: ${dto.decision_reason}`,
    );

    return updated;
  }

  // Student acknowledges the decision
  async studentAcknowledge(
    id: number,
    dto: AcknowledgePembinaanWakaDto,
    student_id: number,
  ): Promise<PembinaanWaka> {
    const pembinaanWaka = await this.findOne(id);

    // Verify student is the one affected
    const reservasi = await this.reservasiRepository.findOne({
      where: { id: pembinaanWaka.reservasi_id },
    });

    if (!reservasi || reservasi.studentId !== student_id) {
      throw new ForbiddenException('Only the affected student can acknowledge this decision');
    }

    // Only can acknowledge if status is 'decided'
    if (pembinaanWaka.status !== 'decided') {
      throw new BadRequestException(
        `Cannot acknowledge. Current status is ${pembinaanWaka.status}. Decision must be 'decided' first.`,
      );
    }

    if (dto.acknowledged) {
      pembinaanWaka.student_acknowledged = true;
      pembinaanWaka.student_response = dto.student_response ?? null;
      // Don't update status yet - wait for execution
    }

    return await this.pembinaanWakaRepository.save(pembinaanWaka);
  }

  // Transition to 'executed' - decision has been carried out (SP3 issued, dropout processed, etc)
  async markAsExecuted(id: number, waka_id: number, execution_notes?: string): Promise<PembinaanWaka> {
    const pembinaanWaka = await this.findOne(id);

    // Verify WAKA is the assigned one
    if (pembinaanWaka.waka_id !== waka_id) {
      throw new ForbiddenException('Only the assigned WAKA can execute the decision');
    }

   // Can only mark as executed if status is 'decided' and student acknowledged
    if (pembinaanWaka.status !== 'decided') {
      throw new BadRequestException(
        `Cannot execute. Current status is ${pembinaanWaka.status}. Must be 'decided' first.`,
      );
    }

    if (!pembinaanWaka.student_acknowledged) {
      throw new BadRequestException('Student must acknowledge the decision before execution');
    }

    pembinaanWaka.status = 'executed';
    if (execution_notes) {
      pembinaanWaka.notes = execution_notes;
    } else {
      pembinaanWaka.notes = pembinaanWaka.notes ?? null;
    }
    pembinaanWaka.updated_by = waka_id;

    this.logger.log(
      `PembinaanWaka ${id} marked as executed. Decision: ${pembinaanWaka.wak_decision}. Updated by WAKA ${waka_id}`,
    );

    return await this.pembinaanWakaRepository.save(pembinaanWaka);
  }

  // Submit appeal (student disputes decision)
  async submitAppeal(id: number, dto: AppealPembinaanWakaDto, student_id: number): Promise<PembinaanWaka> {
    const pembinaanWaka = await this.findOne(id);

    // Verify student is the one affected
    const reservasi = await this.reservasiRepository.findOne({
      where: { id: pembinaanWaka.reservasi_id },
    });

    if (!reservasi || reservasi.studentId !== student_id) {
      throw new ForbiddenException('Only the affected student can appeal this decision');
    }

    // Can only appeal if status is 'decided' or 'executed'
    if (!['decided', 'executed'].includes(pembinaanWaka.status)) {
      throw new BadRequestException(
        `Cannot appeal. Current status is ${pembinaanWaka.status}. Can only appeal 'decided' or 'executed' decisions.`,
      );
    }

    pembinaanWaka.has_appeal = true;
    pembinaanWaka.appeal_reason = dto.appeal_reason ?? null;
    pembinaanWaka.appeal_date = new Date();
    pembinaanWaka.status = 'appealed';

    this.logger.log(`Student ${student_id} appealed PembinaanWaka ${id}. Reason: ${dto.appeal_reason}`);

    return await this.pembinaanWakaRepository.save(pembinaanWaka);
  }

  // WAKA decides on appeal
  async decideOnAppeal(
    id: number,
    appealDecision: 'sp3' | 'do',
    waka_id: number,
  ): Promise<PembinaanWaka> {
    const pembinaanWaka = await this.findOne(id);

    // Verify WAKA is the assigned one
    if (pembinaanWaka.waka_id !== waka_id) {
      throw new ForbiddenException('Only the assigned WAKA can decide on appeal');
    }

    // Can only decide on appeal if status is 'appealed'
    if (pembinaanWaka.status !== 'appealed') {
      throw new BadRequestException(
        `Cannot decide on appeal. Current status is ${pembinaanWaka.status}. Must be 'appealed' to handle appeal.`,
      );
    }

    pembinaanWaka.appeal_decision = appealDecision;
    pembinaanWaka.status = 'decided'; // Revert to decided for execution
    pembinaanWaka.wak_decision = appealDecision; // Update main decision if appeal is accepted
    pembinaanWaka.student_acknowledged = false; // Reset acknowledgement for new decision
    pembinaanWaka.updated_by = waka_id;

    this.logger.log(
      `WAKA ${waka_id} decided on appeal for PembinaanWaka ${id}. New decision: ${appealDecision}`,
    );

    return await this.pembinaanWakaRepository.save(pembinaanWaka);
  }

  // Get statistics for WAKA dashboard
  async getWakaStatistics(waka_id: number): Promise<{
    pending: number;
    inReview: number;
    decided: number;
    executed: number;
    appealed: number;
    sp3Total: number;
    doTotal: number;
  }> {
    const [pending, inReview, decided, executed, appealed, sp3Total, doTotal] = await Promise.all([
      this.pembinaanWakaRepository.count({
        where: { waka_id, status: 'pending' },
      }),
      this.pembinaanWakaRepository.count({
        where: { waka_id, status: 'in_review' },
      }),
      this.pembinaanWakaRepository.count({
        where: { waka_id, status: 'decided' },
      }),
      this.pembinaanWakaRepository.count({
        where: { waka_id, status: 'executed' },
      }),
      this.pembinaanWakaRepository.count({
        where: { waka_id, status: 'appealed' },
      }),
      this.pembinaanWakaRepository.count({
        where: { waka_id, wak_decision: 'sp3' },
      }),
      this.pembinaanWakaRepository.count({
        where: { waka_id, wak_decision: 'do' },
      }),
    ]);

    return {
      pending,
      inReview,
      decided,
      executed,
      appealed,
      sp3Total,
      doTotal,
    };
  }

  // Update pembinaan waka (e.g., parent notification status)
  async update(id: number, dto: UpdatePembinaanWakaDto): Promise<PembinaanWaka> {
    const pembinaanWaka = await this.findOne(id);

    if (dto.notes !== undefined) {
      pembinaanWaka.notes = dto.notes ?? null;
    }
    if (dto.parent_notified !== undefined) {
      pembinaanWaka.parent_notified = dto.parent_notified;
    }
    if (dto.parent_notification_date !== undefined) {
      pembinaanWaka.parent_notification_date = dto.parent_notification_date ? new Date(dto.parent_notification_date) : null;
    }

    return await this.pembinaanWakaRepository.save(pembinaanWaka);
  }
}
