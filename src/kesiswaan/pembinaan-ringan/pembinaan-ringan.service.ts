import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PembinaanRingan } from './entities/pembinaan-ringan.entity';
import { CreatePembinaanRinganDto, ApprovePembinaanRinganDto, CompletePembinaanRinganDto, UpdatePembinaanRinganDto } from './dto/create-pembinaan-ringan.dto';
import { Reservasi } from '../../reservasi/entities/reservasi.entity';

@Injectable()
export class PembinaanRinganService {
  private readonly logger = new Logger(PembinaanRinganService.name);

  constructor(
    @InjectRepository(PembinaanRingan)
    private pembinaanRinganRepo: Repository<PembinaanRingan>,
    @InjectRepository(Reservasi)
    private reservasiRepo: Repository<Reservasi>,
  ) {}

  /**
   * Create pembinaan ringan dari reservasi
   * Called saat kesiswaan membuat reservasi untuk proses ke BK
   * reservasi_id optional - dapat dibuat kemudian jika perlu
   */
  async create(createDto: CreatePembinaanRinganDto): Promise<PembinaanRingan> {
    try {
      // Validate reservasi if provided
      if (createDto.reservasi_id) {
        const reservasi = await this.reservasiRepo.findOne({
          where: { id: createDto.reservasi_id },
        });

        if (!reservasi) {
          throw new NotFoundException(`Reservasi ${createDto.reservasi_id} tidak ditemukan`);
        }
      }

      // Parse scheduled_date dan scheduled_time
      const scheduledDate = new Date(createDto.scheduled_date);

      const pembinaanRingan = this.pembinaanRinganRepo.create({
        reservasi_id: createDto.reservasi_id || null,
        pembinaan_id: createDto.pembinaan_id,
        student_id: createDto.student_id,
        student_name: createDto.student_name,
        counselor_id: createDto.counselor_id,
        hasil_pembinaan: createDto.hasil_pembinaan,
        catatan_bk: createDto.catatan_bk,
        scheduled_date: scheduledDate,
        scheduled_time: createDto.scheduled_time,
        sp_level: createDto.sp_level || null,
        status: 'pending',
      });

      const saved = await this.pembinaanRinganRepo.save(pembinaanRingan);
      this.logger.log(`✅ Pembinaan Ringan created for student ${createDto.student_id}${createDto.reservasi_id ? ` (Reservasi: ${createDto.reservasi_id})` : ''}`);
      return saved;
    } catch (error) {
      this.logger.error(`Error creating pembinaan ringan: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all pembinaan ringan
   */
  async findAll(): Promise<PembinaanRingan[]> {
    return this.pembinaanRinganRepo.find({
      relations: ['reservasi', 'pembinaan', 'counselor'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get pending pembinaan ringan for BK
   */
  async findPendingForCounselor(counselorId: number): Promise<PembinaanRingan[]> {
    return this.pembinaanRinganRepo.find({
      where: {
        counselor_id: counselorId,
        status: 'pending',
      },
      relations: ['reservasi', 'pembinaan'],
      order: { scheduled_date: 'ASC' },
    });
  }

  /**
   * Get pembinaan ringan by ID
   */
  async findOne(id: number): Promise<PembinaanRingan> {
    const record = await this.pembinaanRinganRepo.findOne({
      where: { id },
      relations: ['reservasi', 'pembinaan', 'counselor'],
    });

    if (!record) {
      throw new NotFoundException(`Pembinaan Ringan ${id} tidak ditemukan`);
    }

    return record;
  }

  /**
   * Approve atau reject pembinaan ringan (by BK)
   */
  async approve(id: number, approveDto: ApprovePembinaanRinganDto): Promise<PembinaanRingan> {
    const record = await this.findOne(id);

    if (record.status !== 'pending') {
      throw new BadRequestException(`Pembinaan Ringan sudah dalam status ${record.status}`);
    }

    record.status = approveDto.status;
    record.bk_feedback = approveDto.bk_feedback || null;
    record.bk_notes = approveDto.bk_notes || null;
    if (approveDto.sp_level !== undefined) {
      record.sp_level = approveDto.sp_level || null;
    }

    if (approveDto.status === 'approved') {
      record.approvedAt = new Date();
    }

    const updated = await this.pembinaanRinganRepo.save(record);
    this.logger.log(`✅ Pembinaan Ringan ${id} ${approveDto.status}`);
    return updated;
  }

  /**
   * Complete pembinaan ringan (by BK after counseling)
   */
  async complete(id: number, completeDto: CompletePembinaanRinganDto): Promise<PembinaanRingan> {
    const record = await this.findOne(id);

    if (record.status === 'completed' || record.status === 'rejected' || record.status === 'cancelled') {
      throw new BadRequestException(`Tidak dapat complete pembinaan yang sudah ${record.status}`);
    }

    record.status = 'completed';
    record.bk_feedback = completeDto.bk_feedback;
    record.bk_notes = completeDto.bk_notes || null;
    record.has_follow_up = completeDto.has_follow_up || false;
    record.follow_up_notes = completeDto.follow_up_notes || null;
    record.completedAt = new Date();

    const updated = await this.pembinaanRinganRepo.save(record);
    this.logger.log(`✅ Pembinaan Ringan ${id} completed`);
    return updated;
  }

  /**
   * Update pembinaan ringan
   */
  async update(id: number, updateDto: UpdatePembinaanRinganDto): Promise<PembinaanRingan> {
    const record = await this.findOne(id);

    Object.assign(record, updateDto);

    const updated = await this.pembinaanRinganRepo.save(record);
    this.logger.log(`✅ Pembinaan Ringan ${id} updated`);
    return updated;
  }

  /**
   * Get pembinaan ringan by student ID
   */
  async findByStudentId(studentId: number): Promise<PembinaanRingan[]> {
    return this.pembinaanRinganRepo.find({
      where: { student_id: studentId },
      relations: ['reservasi', 'pembinaan', 'counselor'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get statistics
   */
  async getStatistics(): Promise<any> {
    const total = await this.pembinaanRinganRepo.count();
    const pending = await this.pembinaanRinganRepo.count({ where: { status: 'pending' } });
    const approved = await this.pembinaanRinganRepo.count({ where: { status: 'approved' } });
    const completed = await this.pembinaanRinganRepo.count({ where: { status: 'completed' } });
    const cancelled = await this.pembinaanRinganRepo.count({ where: { status: 'cancelled' } });

    return {
      total,
      pending,
      approved,
      completed,
      cancelled,
    };
  }
}
