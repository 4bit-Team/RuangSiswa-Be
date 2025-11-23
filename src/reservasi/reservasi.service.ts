import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservasi } from './entities/reservasi.entity';
import { CreateReservasiDto, UpdateReservasiStatusDto } from './dto/create-reservasi.dto';
import { ChatService } from '../chat/chat.service';

@Injectable()
export class ReservasiService {
  constructor(
    @InjectRepository(Reservasi)
    private reservasiRepository: Repository<Reservasi>,
    private chatService: ChatService,
  ) {}

  // Create reservasi baru
  async create(createReservasiDto: CreateReservasiDto) {
    const reservasi = this.reservasiRepository.create(createReservasiDto);
    return await this.reservasiRepository.save(reservasi);
  }

  // Get all reservasi dengan filter
  async findAll(filters?: {
    studentId?: number;
    counselorId?: number;
    status?: string;
    from?: Date;
    to?: Date;
  }) {
    let query = this.reservasiRepository
      .createQueryBuilder('reservasi')
      .leftJoinAndSelect('reservasi.student', 'student')
      .leftJoinAndSelect('reservasi.counselor', 'counselor');

    if (filters?.studentId) {
      query = query.where('reservasi.studentId = :studentId', { studentId: filters.studentId });
    }

    if (filters?.counselorId) {
      query = query.where('reservasi.counselorId = :counselorId', { counselorId: filters.counselorId });
    }

    if (filters?.status) {
      query = query.andWhere('reservasi.status = :status', { status: filters.status });
    }

    if (filters?.from && filters?.to) {
      query = query.andWhere('reservasi.preferredDate BETWEEN :from AND :to', {
        from: filters.from,
        to: filters.to,
      });
    }

    return await query.orderBy('reservasi.preferredDate', 'ASC').getMany();
  }

  // Get single reservasi by ID
  async findOne(id: number) {
    return await this.reservasiRepository
      .createQueryBuilder('reservasi')
      .leftJoinAndSelect('reservasi.student', 'student')
      .leftJoinAndSelect('reservasi.counselor', 'counselor')
      .where('reservasi.id = :id', { id })
      .getOne();
  }

  // Get reservasi untuk siswa
  async findByStudentId(studentId: number) {
    return await this.reservasiRepository
      .createQueryBuilder('reservasi')
      .leftJoinAndSelect('reservasi.student', 'student')
      .leftJoinAndSelect('reservasi.counselor', 'counselor')
      .where('reservasi.studentId = :studentId', { studentId })
      .orderBy('reservasi.preferredDate', 'DESC')
      .getMany();
  }

  // Get reservasi untuk counselor
  async findByCounselorId(counselorId: number) {
    return await this.reservasiRepository
      .createQueryBuilder('reservasi')
      .leftJoinAndSelect('reservasi.student', 'student')
      .leftJoinAndSelect('reservasi.counselor', 'counselor')
      .where('reservasi.counselorId = :counselorId', { counselorId })
      .orderBy('reservasi.preferredDate', 'DESC')
      .getMany();
  }

  // Update status reservasi
  async updateStatus(id: number, updateStatusDto: UpdateReservasiStatusDto) {
    const reservasi = await this.findOne(id);
    if (!reservasi) {
      throw new Error('Reservasi not found');
    }

    // Jika status berubah ke 'approved', auto-create conversation
    if (updateStatusDto.status === 'approved' && reservasi.status === 'pending') {
      try {
        // Create conversation
        const conversation = await this.chatService.getOrCreateConversation(
          reservasi.counselorId,
          reservasi.studentId,
          `Sesi ${reservasi.type}: ${reservasi.topic || 'Konseling'}`,
        );

        // Save conversation ID ke reservasi
        reservasi.conversationId = conversation.id;
      } catch (error) {
        console.error('Error creating conversation:', error);
        throw new Error('Failed to create chat conversation');
      }
    }

    reservasi.status = updateStatusDto.status;
    if (updateStatusDto.rejectionReason) {
      reservasi.rejectionReason = updateStatusDto.rejectionReason;
    }

    return await this.reservasiRepository.save(reservasi);
  }

  // Delete reservasi
  async delete(id: number) {
    const result = await this.reservasiRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  // Get pending reservasi untuk counselor specific
  async getPendingForCounselor(counselorId: number) {
    return await this.reservasiRepository
      .createQueryBuilder('reservasi')
      .leftJoinAndSelect('reservasi.student', 'student')
      .leftJoinAndSelect('reservasi.counselor', 'counselor')
      .where('reservasi.counselorId = :counselorId', { counselorId })
      .andWhere('reservasi.status = :status', { status: 'pending' })
      .orderBy('reservasi.preferredDate', 'ASC')
      .getMany();
  }

  // Get approved reservasi dalam date range (untuk schedule view)
  async getSchedule(counselorId: number, from: Date, to: Date) {
    let query = this.reservasiRepository
      .createQueryBuilder('reservasi')
      .leftJoinAndSelect('reservasi.student', 'student')
      .leftJoinAndSelect('reservasi.counselor', 'counselor')
      .where('reservasi.counselorId = :counselorId', { counselorId })
      .andWhere('reservasi.status = :status', { status: 'approved' });

    if (from && to) {
      query = query.andWhere('reservasi.preferredDate BETWEEN :from AND :to', {
        from: new Date(from),
        to: new Date(to),
      });
    }

    return await query
      .orderBy('reservasi.preferredDate', 'ASC')
      .addOrderBy('reservasi.preferredTime', 'ASC')
      .getMany();
  }
}
