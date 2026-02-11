import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Reservasi } from './entities/reservasi.entity';
import { CreateReservasiDto, UpdateReservasiStatusDto, CreatePembinaanReservasiDto } from './dto/create-reservasi.dto';
import { CounselingCategory } from '../counseling-category/entities/counseling-category.entity';
import { ChatService } from '../chat/chat.service';
import { Pembinaan } from '../kesiswaan/pembinaan/entities/pembinaan.entity';
import { PembinaanWaka } from '../kesiswaan/pembinaan-waka/entities/pembinaan-waka.entity';
import { LaporanBkService } from '../laporan-bk/laporan-bk.service';
import { NotificationService } from '../notifications/notification.service';
import * as QRCode from 'qrcode';

@Injectable()
export class ReservasiService {
  constructor(
    @InjectRepository(Reservasi)
    private reservasiRepository: Repository<Reservasi>,
    @InjectRepository(CounselingCategory)
    private categoryRepository: Repository<CounselingCategory>,
    @InjectRepository(Pembinaan)
    private pembinaanRepository: Repository<Pembinaan>,
    @InjectRepository(PembinaanWaka)
    private pembinaanWakaRepository: Repository<PembinaanWaka>,
    private chatService: ChatService,
    private laporanBkService: LaporanBkService,
    @Optional()
    @Inject(forwardRef(() => NotificationService))
    private notificationService?: NotificationService,
  ) {}

  // Create reservasi baru
  async create(createReservasiDto: CreateReservasiDto) {
    // Load topic category if provided
    let topic: CounselingCategory | null = null;
    if (createReservasiDto.topicId) {
      topic = await this.categoryRepository.findOne({
        where: { id: Number(createReservasiDto.topicId) },
      });

      if (!topic) {
        throw new BadRequestException('Topik konseling tidak ditemukan');
      }
    }

    const reservasi = this.reservasiRepository.create({
      studentId: createReservasiDto.studentId,
      counselorId: createReservasiDto.counselorId,
      preferredDate: createReservasiDto.preferredDate,
      preferredTime: createReservasiDto.preferredTime,
      notes: createReservasiDto.notes,
      topicId: createReservasiDto.topicId,
      ...(topic && { topic }),
      status: 'pending',
    });

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
      .leftJoinAndSelect('reservasi.counselor', 'counselor')
      .leftJoinAndSelect('reservasi.topic', 'topic');

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
      .leftJoinAndSelect('reservasi.topic', 'topic')
      .where('reservasi.id = :id', { id })
      .getOne();
  }

  // Get reservasi untuk siswa
  async findByStudentId(studentId: number) {
    return await this.reservasiRepository
      .createQueryBuilder('reservasi')
      .leftJoinAndSelect('reservasi.student', 'student')
      .leftJoinAndSelect('reservasi.counselor', 'counselor')
      .leftJoinAndSelect('reservasi.topic', 'topic') //update
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
      .leftJoinAndSelect('reservasi.topic', 'topic') //update
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
        const topicName = typeof reservasi.topic === 'object' ? reservasi.topic?.name : reservasi.topic;
        const conversation = await this.chatService.getOrCreateConversation(
          reservasi.counselorId,
          reservasi.studentId,
          `Sesi ${reservasi.type}: ${topicName || 'Konseling'}`,
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

        // Auto-create LaporanBK if this is a 'ringan' pembinaan reservasi
        if (reservasi.counselingType === 'khusus' && reservasi.pembinaanType === 'ringan') {
          try {
            // Load full reservasi with relationships
            const fullReservasi = await this.reservasiRepository.findOne({
              where: { id: reservasi.id },
              relations: ['student', 'pembinaan'],
            });

            if (fullReservasi && fullReservasi.pembinaan) {
              const laporanBkDto = {
                reservasi_id: fullReservasi.id,
                pembinaan_id: fullReservasi.pembinaan_id,
                student_id: fullReservasi.studentId,
                bk_id: fullReservasi.counselorId,
              };

              // Create LaporanBK via service
              await this.laporanBkService.create(laporanBkDto);
              console.log(`✅ Auto-created LaporanBK for ringan reservasi ${fullReservasi.id}`);
            }
          } catch (error) {
            console.warn('Failed to auto-create LaporanBK for ringan reservasi:', error);
            // Don't fail the whole operation if LaporanBK creation fails
          }
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

    const updatedReservasi = await this.reservasiRepository.save(reservasi);

    // Create and send notifications based on status change
    try {
      if (updateStatusDto.status === 'approved') {
        // Check if this is a pembinaan type reservasi
        if (updatedReservasi.counselingType === 'khusus' && updatedReservasi.pembinaanType) {
          // Notification for kesiswaan: pembinaan_disetujui
          // TODO: Map to actual kesiswaan staff who created the reservasi
          // For now: Send notification to the counselor (BK/WAKA) who approved it
          // In future: Should identify who from Kesiswaan created this reservasi
          if (this.notificationService) {
            await this.notificationService.create({
              recipient_id: updatedReservasi.counselorId,
              type: 'pembinaan_disetujui',
              title: 'Pembinaan Disetujui',
              message: `Pembinaan untuk siswa dari reservasi ID ${updatedReservasi.id} telah disetujui oleh ${updatedReservasi.pembinaanType === 'ringan' ? 'BK' : 'WAKA'}. Siap untuk dimulai pada ${new Date(updatedReservasi.preferredDate).toLocaleDateString('id-ID')}.`,
              related_id: updatedReservasi.id,
              related_type: 'reservasi',
              metadata: {
                student_id: updatedReservasi.studentId,
                pembinaan_type: updatedReservasi.pembinaanType,
                preferred_date: updatedReservasi.preferredDate,
                approved_by: updatedReservasi.counselorId,
              },
            });
            console.log(`✅ Notification sent: pembinaan_disetujui for kesiswaan`);
          }
        } else {
          // Regular reservasi approved notification
          if (this.notificationService) {
            await this.notificationService.create({
              recipient_id: updatedReservasi.studentId,
              type: 'reservasi_approved',
              title: 'Reservasi Disetujui',
              message: `Reservasi konseling ${updatedReservasi.type || 'Anda'} telah disetujui. Silakan cek jadwal sesi Anda.`,
              related_id: updatedReservasi.id,
              related_type: 'reservasi',
              metadata: {
                student_id: updatedReservasi.studentId,
                counselor_id: updatedReservasi.counselorId,
                reservasi_type: updatedReservasi.type,
                preferred_date: updatedReservasi.preferredDate,
              },
            });
            console.log(`✅ Notification sent: reservasi_approved for student ${updatedReservasi.studentId}`);
          }
        }
      } else if (updateStatusDto.status === 'rejected') {
        // Notification for rejection
        if (this.notificationService) {
          await this.notificationService.create({
            recipient_id: updatedReservasi.studentId,
            type: 'reservasi_rejected',
            title: 'Reservasi Ditolak',
            message: `Reservasi konseling Anda ditolak oleh konselor. ${updateStatusDto.rejectionReason ? `Alasan: ${updateStatusDto.rejectionReason}` : ''}`,
            related_id: updatedReservasi.id,
            related_type: 'reservasi',
            metadata: {
              student_id: updatedReservasi.studentId,
              counselor_id: updatedReservasi.counselorId,
              rejection_reason: updateStatusDto.rejectionReason,
            },
          });

          console.log(`✅ Notification sent: reservasi_rejected for student ${updatedReservasi.studentId}`);
        }
      }
    } catch (error) {
      console.warn('Failed to create notification for reservasi status change:', error);
      // Don't fail the whole operation if notification fails
    }

    return updatedReservasi;
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
      .leftJoinAndSelect('reservasi.topic', 'topic') //update
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
      .leftJoinAndSelect('reservasi.topic', 'topic') //update
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

  // Create reservasi khusus untuk pembinaan (dari PembinaanPage action ringan/berat)
  async createPembinaanReservasi(dto: CreatePembinaanReservasiDto): Promise<Reservasi> {
    // Validasi pembinaan exists
    const pembinaan = await this.pembinaanRepository.findOne({
      where: { id: dto.pembinaan_id },
    });

    if (!pembinaan) {
      throw new BadRequestException(`Pembinaan with ID ${dto.pembinaan_id} not found`);
    }

    if (!pembinaan.siswas_id) {
      throw new BadRequestException('Pembinaan does not have associated student');
    }

    // Validasi pembinaanType
    if (!['ringan', 'berat'].includes(dto.pembinaanType)) {
      throw new BadRequestException(`Invalid pembinaanType: ${dto.pembinaanType}. Must be 'ringan' or 'berat'`);
    }

    // Validasi counselor ID exists (akan di-handle di controller via guards/validation)
    // Tapi untuk sekarang, kami cukup pastikan tidak null
    if (!dto.counselorId) {
      throw new BadRequestException('counselorId is required');
    }

    // Create reservasi dengan counselingType='khusus' dan pembinaanType dari parameter
    const reservasi = this.reservasiRepository.create({
      studentId: pembinaan.siswas_id,
      counselorId: dto.counselorId,
      preferredDate: dto.preferredDate,
      preferredTime: dto.preferredTime,
      type: dto.type || 'tatap-muka', // Default to tatap-muka untuk pembinaan
      counselingType: 'khusus', // Always 'khusus' for pembinaan
      pembinaanType: dto.pembinaanType as 'ringan' | 'berat',
      pembinaan_id: dto.pembinaan_id,
      room: dto.room,
      notes: dto.notes,
      status: 'pending', // Start with pending, BK/WAKA will approve
    });

    const savedReservasi = await this.reservasiRepository.save(reservasi);

    // Send notification to Kesiswaan staff that pembinaan reservasi has been created
    try {
      // TODO: Map counselorId to actual kesiswaan staff user
      // For now, send to counselorId (who requested the guidance)
      if (this.notificationService) {
        await this.notificationService.create({
          recipient_id: dto.counselorId,
          type: 'reservasi_pembinaan_dibuat',
          title: 'Reservasi Pembinaan Dibuat',
          message: `Reservasi pembinaan telah dibuat. Tipe: ${dto.pembinaanType === 'ringan' ? 'Ringan (BK)' : 'Berat (WAKA)'}. Menunggu persetujuan.`,
          related_id: savedReservasi.id,
          related_type: 'reservasi',
          metadata: {
            student_id: savedReservasi.studentId,
            pembinaan_id: dto.pembinaan_id,
            pembinaan_type: dto.pembinaanType,
            preferred_date: dto.preferredDate,
          },
        });
        console.log(`✅ Notification sent: reservasi_pembinaan_dibuat for kesiswaan staff`);
      }
    } catch (error) {
      console.warn('Failed to create notification for pembinaan reservasi creation:', error);
    }

    // Create bimbingan pembina record if type is 'berat' (untuk WAKA decision)
    if (dto.pembinaanType === 'berat') {
      try {
        const pembinaanWaka = this.pembinaanWakaRepository.create({
          reservasi_id: savedReservasi.id,
          pembinaan_id: dto.pembinaan_id,
          waka_id: dto.counselorId, // WAKA is the counselor for 'berat' type
          status: 'pending',
          created_by: dto.counselorId,
        });
        await this.pembinaanWakaRepository.save(pembinaanWaka);
      } catch (error) {
        console.warn('Failed to create PembinaanWaka for berat pembinaan:', error);
        // Don't fail the whole operation if PembinaanWaka creation fails
      }
    }

    // Create laporan BK record if type is 'ringan' (untuk BK tracking session coaching)
    if (dto.pembinaanType === 'ringan') {
      try {
        await this.laporanBkService.create({
          reservasi_id: savedReservasi.id,
          pembinaan_id: dto.pembinaan_id,
          student_id: pembinaan.siswas_id,
          bk_id: dto.counselorId, // BK is the counselor for 'ringan' type
        });
      } catch (error) {
        console.warn('Failed to create LaporanBK for ringan pembinaan:', error);
        // Don't fail the whole operation if LaporanBK creation fails
      }
    }

    // Create conversation untuk komunikasi BK/WAKA-Student
    try {
      const conversationData = await this.chatService.getConversation(
        savedReservasi.studentId,
        pembinaan.siswas_id,
        50,
      );

      savedReservasi.conversationId = conversationData.conversation.id;
      await this.reservasiRepository.save(savedReservasi);
    } catch (error) {
      console.warn('Failed to create conversation for pembinaan reservasi:', error);
      // Don't fail the whole operation if conversation creation fails
    }

    return savedReservasi;
  }

  // Find reservasi by counselingType (umum/kelompok/khusus)
  async findByCounselingType(counselingType: string): Promise<Reservasi[]> {
    return this.reservasiRepository.find({
      where: { counselingType: counselingType as any },
      relations: ['student', 'counselor', 'pembinaan'],
    });
  }

  // Find reservasi by pembinaanId (untuk tracking status pembinaan)
  async findByPembinaanId(pembinaan_id: number): Promise<Reservasi | null> {
    return this.reservasiRepository.findOne({
      where: { pembinaan_id },
      relations: ['student', 'counselor', 'pembinaan'],
    });
  }

  // Find reservasi by pembinaanType (ringan/berat) for BK/WAKA dashboards
  async findByPembinaanType(pembinaanType: 'ringan' | 'berat'): Promise<Reservasi[]> {
    return this.reservasiRepository.find({
      where: { 
        pembinaanType,
        counselingType: 'khusus' // Only pembinaan reservasi
      },
      relations: ['student', 'counselor', 'pembinaan'],
    });
  }
}
