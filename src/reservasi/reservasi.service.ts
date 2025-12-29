import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservasi } from './entities/reservasi.entity';
import { CreateReservasiDto, UpdateReservasiStatusDto } from './dto/create-reservasi.dto';
import { ChatService } from '../chat/chat.service';
import * as QRCode from 'qrcode';

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

    // Jika status berubah ke 'approved', auto-create conversation dan generate QR
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

        // Reset conversation status ke 'active' jika sebelumnya 'completed'
        if (conversation.status === 'completed') {
          await this.chatService.updateConversationStatus(conversation.id, 'active');
          console.log(`✅ Reset conversation ${conversation.id} status dari 'completed' ke 'active'`);
        }

        // Auto-generate QR code untuk tatap muka sessions
        if (reservasi.type === 'tatap-muka') {
          // Auto-assign room
          const roomCount = await this.reservasiRepository.count({
            where: { type: 'tatap-muka', status: 'approved' }
          });
          reservasi.room = `BK-${(roomCount % 3) + 1}`;

          // Generate QR code
          const qrData = JSON.stringify({
            reservasiId: reservasi.id,
            studentId: reservasi.studentId,
            counselorId: reservasi.counselorId,
            timestamp: new Date().toISOString(),
          });
          reservasi.qrCode = await QRCode.toDataURL(qrData);
        }
      } catch (error) {
        console.error('Error creating conversation or QR:', error);
        throw new Error('Failed to create chat conversation or generate QR');
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

  // Reschedule reservasi - update date, time, dan/atau counselor
  async reschedule(
    id: number,
    rescheduleData: {
      preferredDate?: string;
      preferredTime?: string;
      counselorId?: number;
    },
  ) {
    const reservasi = await this.findOne(id);
    
    if (!reservasi) {
      throw new Error('Reservasi not found');
    }

    // Update fields jika disediakan
    if (rescheduleData.preferredDate) {
      reservasi.preferredDate = new Date(rescheduleData.preferredDate);
    }
    
    if (rescheduleData.preferredTime) {
      reservasi.preferredTime = rescheduleData.preferredTime;
    }
    
    if (rescheduleData.counselorId) {
      reservasi.counselorId = rescheduleData.counselorId;
    }

    // Keep status as 'pending' untuk pending dari counselor
    reservasi.status = 'pending';

    return await this.reservasiRepository.save(reservasi);
  }

  // Generate QR code untuk tatap muka session
  async generateQRCode(id: number): Promise<string> {
    const reservasi = await this.findOne(id);
    
    if (!reservasi) {
      throw new Error('Reservasi not found');
    }

    if (reservasi.type !== 'tatap-muka') {
      throw new Error('QR code hanya untuk sesi tatap muka');
    }

    // Generate QR code data dengan format: reservasi_id|student_id|counselor_id|timestamp
    const qrData = JSON.stringify({
      reservasiId: reservasi.id,
      studentId: reservasi.studentId,
      counselorId: reservasi.counselorId,
      timestamp: new Date().toISOString(),
    });

    // Generate QR code sebagai data URL
    const qrCode = await QRCode.toDataURL(qrData);
    
    // Save QR code ke database
    reservasi.qrCode = qrCode;
    await this.reservasiRepository.save(reservasi);

    return qrCode;
  }

  // Confirm attendance via QR scan
  async confirmAttendance(id: number, qrData: string): Promise<Reservasi> {
    const reservasi = await this.findOne(id);
    
    if (!reservasi) {
      throw new Error('Reservasi not found');
    }

    if (reservasi.type !== 'tatap-muka') {
      throw new Error('Attendance hanya untuk sesi tatap muka');
    }

    // Verify QR data
    try {
      const data = JSON.parse(qrData);
      if (data.reservasiId !== id) {
        throw new Error('QR code tidak sesuai dengan reservasi');
      }
    } catch (error) {
      throw new Error('Invalid QR code');
    }

    // Update attendance status dan ubah status menjadi in_counseling
    reservasi.attendanceConfirmed = true;
    reservasi.status = 'in_counseling';
    await this.reservasiRepository.save(reservasi);

    // Update conversation status jika ada
    if (reservasi.conversationId) {
      await this.chatService.updateConversationStatus(reservasi.conversationId, 'in_counseling');
    }

    return reservasi;
  }

  // Mark reservasi sebagai selesai (hanya bisa dari status in_counseling)
  async markAsCompleted(id: number): Promise<Reservasi> {
    const reservasi = await this.findOne(id);
    
    if (!reservasi) {
      throw new Error('Reservasi not found');
    }

    // Hanya bisa mark as completed jika status in_counseling atau approved (untuk chat sessions)
    if (!['in_counseling', 'approved'].includes(reservasi.status)) {
      throw new Error(`Cannot mark as completed from status ${reservasi.status}`);
    }

    reservasi.status = 'completed';
    reservasi.completedAt = new Date();
    const result = await this.reservasiRepository.save(reservasi);

    // Update conversation status jika ada
    if (reservasi.conversationId) {
      await this.chatService.updateConversationStatus(reservasi.conversationId, 'completed');
    }
    
    return result;
  }

  // Get room assignment untuk tatap muka (auto-generate atau manual)
  async assignRoom(id: number, room?: string): Promise<Reservasi> {
    const reservasi = await this.findOne(id);
    
    if (!reservasi) {
      throw new Error('Reservasi not found');
    }

    // Auto-assign room jika tidak diberikan
    if (!room) {
      // Simple logic: BK-1, BK-2, BK-3, dst
      const roomCount = await this.reservasiRepository.count({
        where: { type: 'tatap-muka', status: 'approved' }
      });
      room = `BK-${(roomCount % 3) + 1}`; // Rotate between BK-1, BK-2, BK-3
    }

    reservasi.room = room;
    return await this.reservasiRepository.save(reservasi);
  }
}
