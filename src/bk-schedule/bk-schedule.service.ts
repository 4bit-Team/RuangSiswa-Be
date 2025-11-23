import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BkSchedule } from './entities/bk-schedule.entity';
import { CreateBkScheduleDto, UpdateBkScheduleDto } from './dto/create-bk-schedule.dto';

@Injectable()
export class BkScheduleService {
  constructor(
    @InjectRepository(BkSchedule)
    private scheduleRepository: Repository<BkSchedule>,
  ) {}

  // Create atau update schedule BK untuk session type tertentu
  async createOrUpdate(createDto: CreateBkScheduleDto) {
    // Cek apakah sudah ada schedule untuk BK dan session type ini
    let schedule = await this.scheduleRepository.findOne({
      where: { bkId: createDto.bkId, sessionType: createDto.sessionType },
    });

    if (schedule) {
      // Update existing
      schedule.startTime = createDto.startTime;
      schedule.endTime = createDto.endTime;
      schedule.availableDays = createDto.availableDays;
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

    if (updateDto.startTime) {
      schedule.startTime = updateDto.startTime;
    }
    if (updateDto.endTime) {
      schedule.endTime = updateDto.endTime;
    }
    if (updateDto.availableDays) {
      schedule.availableDays = updateDto.availableDays;
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

    // Check if day is available
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

    if (!schedule.availableDays.includes(dayOfWeek)) {
      return false;
    }

    // Check if time is within working hours
    const [requestedHour, requestedMinute] = time.split(':').map(Number);
    const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
    const [endHour, endMinute] = schedule.endTime.split(':').map(Number);

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
}
