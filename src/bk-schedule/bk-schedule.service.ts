import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BkSchedule, DaySchedule } from './entities/bk-schedule.entity';
import { CreateBkScheduleDto, UpdateBkScheduleDto } from './dto/create-bk-schedule.dto';
import { Reservasi } from '../reservasi/entities/reservasi.entity';
import { ReservasiStatus } from '../reservasi/enums/reservasi-status.enum';
import { User } from '../users/entities/user.entity';

@Injectable()
export class BkScheduleService {
  constructor(
    @InjectRepository(BkSchedule)
    private scheduleRepository: Repository<BkSchedule>,
    @InjectRepository(Reservasi)
    private reservasiRepository: Repository<Reservasi>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // Create atau update schedule BK untuk session type tertentu
  async createOrUpdate(createDto: CreateBkScheduleDto) {
    // Cek apakah sudah ada schedule untuk BK dan session type ini
    let schedule = await this.scheduleRepository.findOne({
      where: { bkId: createDto.bkId, sessionType: createDto.sessionType },
    });

    if (schedule) {
      // Update existing
      schedule.daySchedules = createDto.daySchedules;
      if (createDto.isActive !== undefined) {
        schedule.isActive = createDto.isActive;
      }
    } else {
      // Create new
      schedule = this.scheduleRepository.create(createDto);
    }

    return await this.scheduleRepository.save(schedule);
  }

  // Get all schedules untuk BK tertentu
  async getSchedulesByBkId(bkId: number) {
    return await this.scheduleRepository.find({
      where: { bkId, isActive: true },
    });
  }

  // Get schedule untuk BK dan session type tertentu
  async getScheduleByBkIdAndType(bkId: number, sessionType: 'tatap-muka' | 'chat') {
    const schedule = await this.scheduleRepository.findOne({
      where: { bkId, sessionType, isActive: true },
    });

    if (!schedule) {
      throw new NotFoundException(
        `Schedule not found for BK ID ${bkId} with session type ${sessionType}`,
      );
    }

    return schedule;
  }

  // Get all active BK schedules
  async getAllActiveSchedules() {
    return await this.scheduleRepository.find({
      where: { isActive: true },
    });
  }

  // Update schedule
  async update(bkId: number, sessionType: 'tatap-muka' | 'chat', updateDto: UpdateBkScheduleDto) {
    const schedule = await this.getScheduleByBkIdAndType(bkId, sessionType);

    if (updateDto.daySchedules) {
      schedule.daySchedules = updateDto.daySchedules;
    }
    if (updateDto.isActive !== undefined) {
      schedule.isActive = updateDto.isActive;
    }

    return await this.scheduleRepository.save(schedule);
  }

  // Check if BK is available at specific date and time untuk session type tertentu
  async isAvailable(
    bkId: number,
    date: Date,
    time: string,
    sessionType: 'tatap-muka' | 'chat',
  ): Promise<boolean> {
    const schedule = await this.scheduleRepository.findOne({
      where: { bkId, sessionType, isActive: true },
    });

    if (!schedule) {
      return false;
    }

    // Get day name
    const dayNames = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const dayOfWeek = dayNames[date.getDay()];

    // Find schedule for this specific day
    const daySchedule = schedule.daySchedules.find(ds => ds.day === dayOfWeek && ds.isActive);

    if (!daySchedule) {
      return false;
    }

    // Check if time is within working hours
    const [requestedHour, requestedMinute] = time.split(':').map(Number);
    const [startHour, startMinute] = daySchedule.startTime.split(':').map(Number);
    const [endHour, endMinute] = daySchedule.endTime.split(':').map(Number);

    const requestedTimeInMinutes = requestedHour * 60 + requestedMinute;
    const startTimeInMinutes = startHour * 60 + startMinute;
    const endTimeInMinutes = endHour * 60 + endMinute;

    return (
      requestedTimeInMinutes >= startTimeInMinutes &&
      requestedTimeInMinutes < endTimeInMinutes
    );
  }

  // Get available BK untuk session type tertentu
  async getAvailableBKs(
    date: Date,
    time: string,
    sessionType: 'tatap-muka' | 'chat',
  ) {
    const allSchedules = await this.scheduleRepository.find({
      where: { sessionType, isActive: true },
    });
    const availableBKIds: number[] = [];

    for (const schedule of allSchedules) {
      const isAvailable = await this.isAvailable(
        schedule.bkId,
        date,
        time,
        sessionType,
      );
      if (isAvailable) {
        availableBKIds.push(schedule.bkId);
      }
    }

    return availableBKIds;
  }

  // Delete schedule untuk session type tertentu
  async delete(bkId: number, sessionType: 'tatap-muka' | 'chat') {
    const result = await this.scheduleRepository.delete({ bkId, sessionType });
    return (result.affected ?? 0) > 0;
  }

  // Check if BK sudah ada booking di jam dan tanggal tertentu (approved atau pending reservasi)
  async hasBooking(
    bkId: number,
    date: Date,
    time: string,
  ): Promise<boolean> {
    const reservasi = await this.reservasiRepository.findOne({
      where: {
        counselorId: bkId,
        preferredDate: date,
        preferredTime: time,
        status: ReservasiStatus.APPROVED, // Hanya count approved reservasi
      },
    });

    return !!reservasi;
  }

  // Get available BK untuk session type tertentu dengan status booking dan detail konselor
  async getAvailableBKsWithStatus(
    date: Date,
    time: string,
    sessionType: 'tatap-muka' | 'chat',
  ) {
    const allSchedules = await this.scheduleRepository.find({
      where: { sessionType, isActive: true },
    });

    const result: Array<{
      bkId: number;
      fullName: string;
      username: string;
      specialty?: string;
      available: boolean;
      booked: boolean;
    }> = [];

    for (const schedule of allSchedules) {
      const isAvailable = await this.isAvailable(
        schedule.bkId,
        date,
        time,
        sessionType,
      );

      if (isAvailable) {
        // Fetch User data by bkId
        const bkUser = await this.userRepository.findOne({
          where: { id: schedule.bkId },
        });

        const hasBooking = await this.hasBooking(schedule.bkId, date, time);
        result.push({
          bkId: schedule.bkId,
          fullName: bkUser?.fullName || bkUser?.username || `Konselor ${schedule.bkId}`,
          username: bkUser?.username || '',
          specialty: bkUser?.specialty,
          available: true,
          booked: hasBooking,
        });
      }
    }

    return result;
  }
}