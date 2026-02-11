"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BkScheduleService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bk_schedule_entity_1 = require("./entities/bk-schedule.entity");
const reservasi_entity_1 = require("../reservasi/entities/reservasi.entity");
const reservasi_status_enum_1 = require("../reservasi/enums/reservasi-status.enum");
const user_entity_1 = require("../users/entities/user.entity");
let BkScheduleService = class BkScheduleService {
    scheduleRepository;
    reservasiRepository;
    userRepository;
    constructor(scheduleRepository, reservasiRepository, userRepository) {
        this.scheduleRepository = scheduleRepository;
        this.reservasiRepository = reservasiRepository;
        this.userRepository = userRepository;
    }
    async createOrUpdate(createDto) {
        let schedule = await this.scheduleRepository.findOne({
            where: { bkId: createDto.bkId, sessionType: createDto.sessionType },
        });
        if (schedule) {
            schedule.daySchedules = createDto.daySchedules;
            if (createDto.isActive !== undefined) {
                schedule.isActive = createDto.isActive;
            }
        }
        else {
            schedule = this.scheduleRepository.create(createDto);
        }
        return await this.scheduleRepository.save(schedule);
    }
    async getSchedulesByBkId(bkId) {
        return await this.scheduleRepository.find({
            where: { bkId, isActive: true },
        });
    }
    async getScheduleByBkIdAndType(bkId, sessionType) {
        const schedule = await this.scheduleRepository.findOne({
            where: { bkId, sessionType, isActive: true },
        });
        if (!schedule) {
            throw new common_1.NotFoundException(`Schedule not found for BK ID ${bkId} with session type ${sessionType}`);
        }
        return schedule;
    }
    async getAllActiveSchedules() {
        return await this.scheduleRepository.find({
            where: { isActive: true },
        });
    }
    async update(bkId, sessionType, updateDto) {
        const schedule = await this.getScheduleByBkIdAndType(bkId, sessionType);
        if (updateDto.daySchedules) {
            schedule.daySchedules = updateDto.daySchedules;
        }
        if (updateDto.isActive !== undefined) {
            schedule.isActive = updateDto.isActive;
        }
        return await this.scheduleRepository.save(schedule);
    }
    async isAvailable(bkId, date, time, sessionType) {
        const schedule = await this.scheduleRepository.findOne({
            where: { bkId, sessionType, isActive: true },
        });
        if (!schedule) {
            return false;
        }
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
        const daySchedule = schedule.daySchedules.find(ds => ds.day === dayOfWeek && ds.isActive);
        if (!daySchedule) {
            return false;
        }
        const [requestedHour, requestedMinute] = time.split(':').map(Number);
        const [startHour, startMinute] = daySchedule.startTime.split(':').map(Number);
        const [endHour, endMinute] = daySchedule.endTime.split(':').map(Number);
        const requestedTimeInMinutes = requestedHour * 60 + requestedMinute;
        const startTimeInMinutes = startHour * 60 + startMinute;
        const endTimeInMinutes = endHour * 60 + endMinute;
        return (requestedTimeInMinutes >= startTimeInMinutes &&
            requestedTimeInMinutes < endTimeInMinutes);
    }
    async getAvailableBKs(date, time, sessionType) {
        const allSchedules = await this.scheduleRepository.find({
            where: { sessionType, isActive: true },
        });
        const availableBKIds = [];
        for (const schedule of allSchedules) {
            const isAvailable = await this.isAvailable(schedule.bkId, date, time, sessionType);
            if (isAvailable) {
                availableBKIds.push(schedule.bkId);
            }
        }
        return availableBKIds;
    }
    async delete(bkId, sessionType) {
        const result = await this.scheduleRepository.delete({ bkId, sessionType });
        return (result.affected ?? 0) > 0;
    }
    async hasBooking(bkId, date, time) {
        const reservasi = await this.reservasiRepository.findOne({
            where: {
                counselorId: bkId,
                preferredDate: date,
                preferredTime: time,
                status: reservasi_status_enum_1.ReservasiStatus.APPROVED,
            },
        });
        return !!reservasi;
    }
    async getAvailableBKsWithStatus(date, time, sessionType) {
        const allSchedules = await this.scheduleRepository.find({
            where: { sessionType, isActive: true },
        });
        const result = [];
        for (const schedule of allSchedules) {
            const isAvailable = await this.isAvailable(schedule.bkId, date, time, sessionType);
            if (isAvailable) {
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
};
exports.BkScheduleService = BkScheduleService;
exports.BkScheduleService = BkScheduleService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(bk_schedule_entity_1.BkSchedule)),
    __param(1, (0, typeorm_1.InjectRepository)(reservasi_entity_1.Reservasi)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], BkScheduleService);
//# sourceMappingURL=bk-schedule.service.js.map