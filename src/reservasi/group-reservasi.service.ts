import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { GroupReservasi } from './entities/group-reservasi.entity';
import { CreateGroupReservasiDto, UpdateGroupReservasiStatusDto } from './dto/create-group-reservasi.dto';
import { CounselingCategory } from '../counseling-category/entities/counseling-category.entity';
import { User } from '../users/entities/user.entity';
import { ReservasiStatus } from './enums/reservasi-status.enum';
import { SessionType } from './enums/session-type.enum';
import { ChatService } from '../chat/chat.service';
import * as QRCode from 'qrcode';

@Injectable()
export class GroupReservasiService {
  constructor(
    @InjectRepository(GroupReservasi)
    private groupReservasiRepository: Repository<GroupReservasi>,
    @InjectRepository(CounselingCategory)
    private categoryRepository: Repository<CounselingCategory>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private chatService: ChatService,
  ) {}

  // Create group reservasi baru
  async create(createGroupReservasiDto: CreateGroupReservasiDto) {
    // Validate topic category if provided
    let topic: CounselingCategory | null = null;
    if (createGroupReservasiDto.topicId) {
      topic = await this.categoryRepository.findOne({
        where: { id: Number(createGroupReservasiDto.topicId) },
      });

      if (!topic) {
        throw new BadRequestException('Topik konseling tidak ditemukan');
      }
    }

    // Load students
    const students = await this.userRepository.find({
      where: {
        id: In(createGroupReservasiDto.studentIds),
      },
    });

    if (students.length !== createGroupReservasiDto.studentIds.length) {
      throw new BadRequestException('Salah satu atau lebih siswa tidak ditemukan');
    }

    // Ensure at least 2 students in group
    if (students.length < 2) {
      throw new BadRequestException('Konseling kelompok harus memiliki minimal 2 siswa');
    }

    const groupReservasi = this.groupReservasiRepository.create({
      groupName: createGroupReservasiDto.groupName,
      creatorId: createGroupReservasiDto.creatorId,
      students,
      counselorId: createGroupReservasiDto.counselorId,
      preferredDate: createGroupReservasiDto.preferredDate,
      preferredTime: createGroupReservasiDto.preferredTime,
      type: createGroupReservasiDto.type,
      topicId: createGroupReservasiDto.topicId,
      notes: createGroupReservasiDto.notes,
      room: createGroupReservasiDto.room,
      status: ReservasiStatus.PENDING,
      ...(topic && { topic }),
    });

    return await this.groupReservasiRepository.save(groupReservasi);
  }

  // Get all group reservasi dengan filter
  async findAll(filters?: {
    creatorId?: number;
    counselorId?: number;
    status?: string;
    from?: Date;
    to?: Date;
  }) {
    let query = this.groupReservasiRepository
      .createQueryBuilder('groupReservasi')
      .leftJoinAndSelect('groupReservasi.creator', 'creator')
      .leftJoinAndSelect('groupReservasi.counselor', 'counselor')
      .leftJoinAndSelect('groupReservasi.students', 'students')
      .leftJoinAndSelect('groupReservasi.topic', 'topic');

    if (filters?.creatorId) {
      query = query.where('groupReservasi.creatorId = :creatorId', { creatorId: filters.creatorId });
    }

    if (filters?.counselorId) {
      query = query.where('groupReservasi.counselorId = :counselorId', { counselorId: filters.counselorId });
    }

    if (filters?.status) {
      query = query.andWhere('groupReservasi.status = :status', { status: filters.status });
    }

    if (filters?.from && filters?.to) {
      query = query.andWhere('groupReservasi.preferredDate BETWEEN :from AND :to', {
        from: filters.from,
        to: filters.to,
      });
    }

    return await query.orderBy('groupReservasi.preferredDate', 'ASC').getMany();
  }

  // Get single group reservasi by ID
  async findOne(id: number) {
    return await this.groupReservasiRepository
      .createQueryBuilder('groupReservasi')
      .leftJoinAndSelect('groupReservasi.creator', 'creator')
      .leftJoinAndSelect('groupReservasi.counselor', 'counselor')
      .leftJoinAndSelect('groupReservasi.students', 'students')
      .leftJoinAndSelect('groupReservasi.topic', 'topic')
      .where('groupReservasi.id = :id', { id })
      .getOne();
  }

  // Get group reservasi untuk siswa (sebagai member atau creator)
  async findByStudentId(studentId: number) {
    return await this.groupReservasiRepository
      .createQueryBuilder('groupReservasi')
      .leftJoinAndSelect('groupReservasi.creator', 'creator')
      .leftJoinAndSelect('groupReservasi.counselor', 'counselor')
      .leftJoinAndSelect('groupReservasi.students', 'students')
      .leftJoinAndSelect('groupReservasi.topic', 'topic')
      .where(
        'groupReservasi.creatorId = :studentId OR students.id = :studentId',
        { studentId }
      )
      .orderBy('groupReservasi.preferredDate', 'ASC')
      .getMany();
  }

  // Get group reservasi untuk counselor
  async findByCounselorId(counselorId: number) {
    return await this.groupReservasiRepository
      .createQueryBuilder('groupReservasi')
      .leftJoinAndSelect('groupReservasi.creator', 'creator')
      .leftJoinAndSelect('groupReservasi.counselor', 'counselor')
      .leftJoinAndSelect('groupReservasi.students', 'students')
      .leftJoinAndSelect('groupReservasi.topic', 'topic')
      .where('groupReservasi.counselorId = :counselorId', { counselorId })
      .orderBy('groupReservasi.preferredDate', 'ASC')
      .getMany();
  }

  // Get pending group reservasi untuk counselor
  async getPendingForCounselor(counselorId: number) {
    return await this.groupReservasiRepository
      .createQueryBuilder('groupReservasi')
      .leftJoinAndSelect('groupReservasi.creator', 'creator')
      .leftJoinAndSelect('groupReservasi.counselor', 'counselor')
      .leftJoinAndSelect('groupReservasi.students', 'students')
      .leftJoinAndSelect('groupReservasi.topic', 'topic')
      .where('groupReservasi.counselorId = :counselorId', { counselorId: counselorId })
      .andWhere('groupReservasi.status = :status', { status: ReservasiStatus.PENDING })
      .orderBy('groupReservasi.createdAt', 'DESC')
      .getMany();
  }

  // Update status group reservasi
  async updateStatus(
    id: number,
    updateStatusDto: UpdateGroupReservasiStatusDto
  ) {
    const groupReservasi = await this.findOne(id);

    if (!groupReservasi) {
      throw new NotFoundException('Group reservasi tidak ditemukan');
    }
// Jika status berubah ke 'approved'
    if (updateStatusDto.status === ReservasiStatus.APPROVED && groupReservasi.status === ReservasiStatus.PENDING) {
      try {
        // Untuk tatap-muka: Auto-assign room
        if (groupReservasi.type === SessionType.TATAP_MUKA) {
          const roomCount = await this.groupReservasiRepository.count({
            where: { type: SessionType.TATAP_MUKA, status: ReservasiStatus.APPROVED }
          });
          groupReservasi.room = `BK-${(roomCount % 3) + 1}`;
        }

        // Catatan: QR dan Chat akan di-generate 15 menit sebelum sesi
        // Lihat method initializeSessionResources()
      } catch (error) {
        console.error('Error during approval:', error);
        throw new Error('Failed to process group reservasi approval');
      }
    }

    groupReservasi.status = updateStatusDto.status;
    if (updateStatusDto.rejectionReason) {
      groupReservasi.rejectionReason = updateStatusDto.rejectionReason;
    }

    return await this.groupReservasiRepository.save(groupReservasi);
  }

  // Method untuk generate QR dan create chat 15 menit sebelum sesi
  async initializeSessionResources(id: number) {
    const groupReservasi = await this.findOne(id);
    if (!groupReservasi) {
      throw new Error('Group Reservasi not found');
    }

    // Hanya untuk group reservasi yang approved
    if (groupReservasi.status !== ReservasiStatus.APPROVED) {
      throw new Error('Group Reservasi must be approved before initializing session resources');
    }

    // Hitung waktu 15 menit sebelum sesi
    const [hours, minutes] = groupReservasi.preferredTime.split(':').map(Number);
    const sessionStart = new Date(groupReservasi.preferredDate);
    sessionStart.setHours(hours, minutes, 0);
    
    const fifteenMinutesBefore = new Date(sessionStart.getTime() - 15 * 60 * 1000);
    const now = new Date();

    // Validasi bahwa sudah waktunya generate QR / create chat (15 menit sebelum atau lebih)
    if (now < fifteenMinutesBefore) {
      throw new Error('Session resources cannot be initialized yet. Please try again 15 minutes before the session.');
    }

    // Generate QR untuk tatap muka
    if (groupReservasi.type === SessionType.TATAP_MUKA && !groupReservasi.qrCode) {
      const qrData = JSON.stringify({
        reservasiId: groupReservasi.id,
        counselorId: groupReservasi.counselorId,
        timestamp: new Date().toISOString(),
        isGroup: true,
      });
      groupReservasi.qrCode = await QRCode.toDataURL(qrData);
      groupReservasi.qrGeneratedAt = new Date();
      console.log(`✅ QR Code generated for group reservasi ${id}`);
    }

    // Create conversation untuk chat dan tatap muka (conversation for counselor + first student)
    if (!groupReservasi.conversationId && groupReservasi.students && groupReservasi.students.length > 0) {
      try {
        const topicName = typeof groupReservasi.topic === 'object' ? groupReservasi.topic?.name : groupReservasi.topic;
        // Create conversation using first student in group
        const conversation = await this.chatService.getOrCreateConversation(
          groupReservasi.counselorId,
          groupReservasi.students[0].id,
          `Sesi Kelompok ${groupReservasi.type}: ${topicName || 'Konseling'}`,
        );

        groupReservasi.conversationId = conversation.id;
        groupReservasi.chatInitializedAt = new Date();

        // Reset conversation status ke 'active' jika sebelumnya 'completed'
        if (conversation.status === 'completed') {
          await this.chatService.updateConversationStatus(conversation.id, 'active');
          console.log(`✅ Reset conversation ${conversation.id} status dari 'completed' ke 'active'`);
        }

        console.log(`✅ Chat conversation created/initialized for group reservasi ${id}`);
      } catch (error) {
        console.error('Error creating conversation:', error);
        throw new Error('Failed to create chat conversation');
      }
    }

    return await this.groupReservasiRepository.save(groupReservasi);
  }

  // Delete group reservasi
  async remove(id: number) {
    const groupReservasi = await this.findOne(id);

    if (!groupReservasi) {
      throw new NotFoundException('Group reservasi tidak ditemukan');
    }

    return await this.groupReservasiRepository.remove(groupReservasi);
  }
}
