import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PembinaanOrtu } from './entities/pembinaan-ortu.entity';
import { CreatePembinaanOrtuDto, UpdatePembinaanOrtuDto, SendLetterDto, RecordMeetingDto, RespondFromParentDto } from './dto/create-pembinaan-ortu.dto';
import { Pembinaan } from '../pembinaan/entities/pembinaan.entity';

@Injectable()
export class PembinaanOrtuService {
  private readonly logger = new Logger(PembinaanOrtuService.name);

  constructor(
    @InjectRepository(PembinaanOrtu)
    private pembinaanOrtuRepo: Repository<PembinaanOrtu>,
    @InjectRepository(Pembinaan)
    private pembinaanRepo: Repository<Pembinaan>,
  ) {}

  /**
   * Create pembinaan ortu (surat pemanggilan orang tua)
   */
  async create(createDto: CreatePembinaanOrtuDto): Promise<PembinaanOrtu> {
    try {
      // Validate pembinaan exists
      const pembinaan = await this.pembinaanRepo.findOne({
        where: { id: createDto.pembinaan_id },
      });

      if (!pembinaan) {
        throw new NotFoundException(`Pembinaan ${createDto.pembinaan_id} tidak ditemukan`);
      }

      const scheduledDate = new Date(createDto.scheduled_date);

      const pembinaanOrtu = new PembinaanOrtu();
      pembinaanOrtu.pembinaan_id = createDto.pembinaan_id;
      pembinaanOrtu.student_id = createDto.student_id;
      pembinaanOrtu.student_name = createDto.student_name;
      pembinaanOrtu.student_class = createDto.student_class;
      pembinaanOrtu.parent_id = (createDto.parent_id || null) as any;
      pembinaanOrtu.parent_name = createDto.parent_name;
      pembinaanOrtu.parent_phone = (createDto.parent_phone || null) as any;
      pembinaanOrtu.violation_details = createDto.violation_details;
      pembinaanOrtu.letter_content = createDto.letter_content;
      pembinaanOrtu.scheduled_date = scheduledDate;
      pembinaanOrtu.scheduled_time = (createDto.scheduled_time || null) as any;
      pembinaanOrtu.location = (createDto.location || null) as any;
      pembinaanOrtu.communication_method = createDto.communication_method || 'manual';
      pembinaanOrtu.kesiswaan_notes = (createDto.kesiswaan_notes || null) as any;
      pembinaanOrtu.status = 'pending';

      const saved = await this.pembinaanOrtuRepo.save(pembinaanOrtu);
      this.logger.log(`✅ Pembinaan Ortu created for student ${createDto.student_id}`);
      return saved;
    } catch (error) {
      this.logger.error(`Error creating pembinaan ortu: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all pembinaan ortu
   */
  async findAll(): Promise<PembinaanOrtu[]> {
    return this.pembinaanOrtuRepo.find({
      relations: ['pembinaan', 'parent'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get pembinaan ortu by ID
   */
  async findOne(id: number): Promise<PembinaanOrtu> {
    const record = await this.pembinaanOrtuRepo.findOne({
      where: { id },
      relations: ['pembinaan', 'parent'],
    });

    if (!record) {
      throw new NotFoundException(`Pembinaan Ortu ${id} tidak ditemukan`);
    }

    return record;
  }

  /**
   * Get pembinaan ortu for parent (view only certain fields)
   */
  async findByParentId(parentId: number): Promise<any[]> {
    const records = await this.pembinaanOrtuRepo.find({
      where: { parent_id: parentId },
      relations: ['pembinaan'],
      order: { createdAt: 'DESC' },
    });

    // Return only relevant fields for parent view
    return records.map(r => ({
      id: r.id,
      student_name: r.student_name,
      student_class: r.student_class,
      violation_details: r.violation_details,
      letter_content: r.letter_content,
      scheduled_date: r.scheduled_date,
      scheduled_time: r.scheduled_time,
      location: r.location,
      status: r.status,
      createdAt: r.createdAt,
    }));
  }

  /**
   * Get pembinaan ortu by student ID
   */
  async findByStudentId(studentId: number): Promise<PembinaanOrtu[]> {
    return this.pembinaanOrtuRepo.find({
      where: { student_id: studentId },
      relations: ['pembinaan', 'parent'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Update pembinaan ortu
   */
  async update(id: number, updateDto: UpdatePembinaanOrtuDto): Promise<PembinaanOrtu> {
    const record = await this.findOne(id);

    if (updateDto.scheduled_date) {
      updateDto.scheduled_date = new Date(updateDto.scheduled_date) as any;
    }

    Object.assign(record, updateDto);

    const updated = await this.pembinaanOrtuRepo.save(record);
    this.logger.log(`✅ Pembinaan Ortu ${id} updated`);
    return updated;
  }

  /**
   * Send letter to parent
   */
  async sendLetter(id: number, sendDto: SendLetterDto): Promise<PembinaanOrtu> {
    const record = await this.findOne(id);

    if (record.status !== 'pending') {
      throw new BadRequestException(`Letter sudah dikirim`);
    }

    record.status = 'sent';
    record.communication_method = sendDto.communication_method;
    record.sent_at = new Date();

    const updated = await this.pembinaanOrtuRepo.save(record);
    this.logger.log(`✅ Letter sent for Pembinaan Ortu ${id} via ${sendDto.communication_method}`);
    return updated;
  }

  /**
   * Record parent response
   */
  async recordParentResponse(id: number, respondDto: RespondFromParentDto): Promise<PembinaanOrtu> {
    const record = await this.findOne(id);

    record.parent_response = respondDto.parent_response;
    record.parent_response_date = new Date();
    record.status = 'responded';

    const updated = await this.pembinaanOrtuRepo.save(record);
    this.logger.log(`✅ Parent response recorded for Pembinaan Ortu ${id}`);
    return updated;
  }

  /**
   * Record meeting result
   */
  async recordMeeting(id: number, recordDto: RecordMeetingDto): Promise<PembinaanOrtu> {
    const record = await this.findOne(id);

    record.meeting_result = recordDto.meeting_result;
    record.meeting_date = new Date();
    record.parent_response = recordDto.parent_response || record.parent_response;
    record.requires_follow_up = recordDto.requires_follow_up || false;
    record.follow_up_notes = (recordDto.follow_up_notes || null) as string | null;
    record.status = 'closed';
    record.closedAt = new Date();

    const updated = await this.pembinaanOrtuRepo.save(record);
    this.logger.log(`✅ Meeting recorded for Pembinaan Ortu ${id}`);
    return updated;
  }

  /**
   * Get pending letters
   */
  async getPendingLetters(): Promise<PembinaanOrtu[]> {
    return this.pembinaanOrtuRepo.find({
      where: { status: 'pending' },
      relations: ['pembinaan', 'parent'],
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Get statistics
   */
  async getStatistics(): Promise<any> {
    const total = await this.pembinaanOrtuRepo.count();
    const pending = await this.pembinaanOrtuRepo.count({ where: { status: 'pending' } });
    const sent = await this.pembinaanOrtuRepo.count({ where: { status: 'sent' } });
    const responded = await this.pembinaanOrtuRepo.count({ where: { status: 'responded' } });
    const closed = await this.pembinaanOrtuRepo.count({ where: { status: 'closed' } });

    return {
      total,
      pending,
      sent,
      responded,
      closed,
    };
  }
}
