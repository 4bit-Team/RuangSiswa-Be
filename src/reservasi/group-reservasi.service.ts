import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { GroupReservasi } from './entities/group-reservasi.entity';
import { CreateGroupReservasiDto, UpdateGroupReservasiStatusDto } from './dto/create-group-reservasi.dto';
import { CounselingCategory } from '../counseling-category/entities/counseling-category.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class GroupReservasiService {
  constructor(
    @InjectRepository(GroupReservasi)
    private groupReservasiRepository: Repository<GroupReservasi>,
    @InjectRepository(CounselingCategory)
    private categoryRepository: Repository<CounselingCategory>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
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
      status: 'pending',
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
      .where('groupReservasi.counselorId = :counselorId', { counselorId })
      .andWhere('groupReservasi.status = :status', { status: 'pending' })
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

    groupReservasi.status = updateStatusDto.status;
    if (updateStatusDto.rejectionReason) {
      groupReservasi.rejectionReason = updateStatusDto.rejectionReason;
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
