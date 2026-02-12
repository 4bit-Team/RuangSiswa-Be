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
exports.BkScheduleController = void 0;
const common_1 = require("@nestjs/common");
const bk_schedule_service_1 = require("./bk-schedule.service");
const create_bk_schedule_dto_1 = require("./dto/create-bk-schedule.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let BkScheduleController = class BkScheduleController {
    scheduleService;
    constructor(scheduleService) {
        this.scheduleService = scheduleService;
    }
    async createOrUpdate(sessionType, createDto, req) {
        createDto.bkId = req.user.id;
        createDto.sessionType = sessionType;
        console.log('📝 Creating/Updating BK schedule:', createDto);
        return await this.scheduleService.createOrUpdate(createDto);
    }
    async getMySchedules(req) {
        const bkId = req.user.id;
        console.log('📖 Getting all schedules for BK:', bkId);
        return await this.scheduleService.getSchedulesByBkId(bkId);
    }
    async getMyScheduleByType(sessionType, req) {
        const bkId = req.user.id;
        console.log('📖 Getting schedule for BK:', bkId, 'sessionType:', sessionType);
        return await this.scheduleService.getScheduleByBkIdAndType(bkId, sessionType);
    }
    async getAvailableBKs(sessionType, date, time) {
        const dateObj = new Date(date);
        console.log(`🔍 Finding available BK for ${date} at ${time} (${sessionType})`);
        const availableBKsWithStatus = await this.scheduleService.getAvailableBKsWithStatus(dateObj, time, sessionType);
        const availableBKIds = availableBKsWithStatus
            .filter(bk => !bk.booked)
            .map(bk => bk.bkId);
        return {
            date,
            time,
            sessionType,
            availableBKIds,
            count: availableBKIds.length,
            bookingStatus: availableBKsWithStatus,
        };
    }
    async checkAvailability(bkId, sessionType, date, time) {
        const dateObj = new Date(date);
        const isAvailable = await this.scheduleService.isAvailable(parseInt(bkId), dateObj, time, sessionType);
        return { bkId: parseInt(bkId), date, time, sessionType, isAvailable };
    }
    async getScheduleByBkIdAndType(bkId, sessionType) {
        return await this.scheduleService.getScheduleByBkIdAndType(parseInt(bkId), sessionType);
    }
    async updateSchedule(sessionType, updateDto, req) {
        const bkId = req.user.id;
        console.log('✏️ Updating BK schedule:', updateDto);
        return await this.scheduleService.update(bkId, sessionType, updateDto);
    }
    async deleteSchedule(sessionType, req) {
        const bkId = req.user.id;
        const success = await this.scheduleService.delete(bkId, sessionType);
        return { success, message: success ? 'Schedule deleted' : 'Failed to delete' };
    }
};
exports.BkScheduleController = BkScheduleController;
__decorate([
    (0, common_1.Post)(':sessionType'),
    __param(0, (0, common_1.Param)('sessionType')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_bk_schedule_dto_1.CreateBkScheduleDto, Object]),
    __metadata("design:returntype", Promise)
], BkScheduleController.prototype, "createOrUpdate", null);
__decorate([
    (0, common_1.Get)('my-schedules'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BkScheduleController.prototype, "getMySchedules", null);
__decorate([
    (0, common_1.Get)('my-schedule/:sessionType'),
    __param(0, (0, common_1.Param)('sessionType')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BkScheduleController.prototype, "getMyScheduleByType", null);
__decorate([
    (0, common_1.Get)('available/:sessionType/:date/:time'),
    __param(0, (0, common_1.Param)('sessionType')),
    __param(1, (0, common_1.Param)('date')),
    __param(2, (0, common_1.Param)('time')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], BkScheduleController.prototype, "getAvailableBKs", null);
__decorate([
    (0, common_1.Get)('check-availability/:bkId/:sessionType'),
    __param(0, (0, common_1.Param)('bkId')),
    __param(1, (0, common_1.Param)('sessionType')),
    __param(2, (0, common_1.Query)('date')),
    __param(3, (0, common_1.Query)('time')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], BkScheduleController.prototype, "checkAvailability", null);
__decorate([
    (0, common_1.Get)(':bkId/:sessionType'),
    __param(0, (0, common_1.Param)('bkId')),
    __param(1, (0, common_1.Param)('sessionType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BkScheduleController.prototype, "getScheduleByBkIdAndType", null);
__decorate([
    (0, common_1.Put)(':sessionType'),
    __param(0, (0, common_1.Param)('sessionType')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_bk_schedule_dto_1.UpdateBkScheduleDto, Object]),
    __metadata("design:returntype", Promise)
], BkScheduleController.prototype, "updateSchedule", null);
__decorate([
    (0, common_1.Delete)(':sessionType'),
    __param(0, (0, common_1.Param)('sessionType')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BkScheduleController.prototype, "deleteSchedule", null);
exports.BkScheduleController = BkScheduleController = __decorate([
    (0, common_1.Controller)('bk-schedule'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [bk_schedule_service_1.BkScheduleService])
], BkScheduleController);
//# sourceMappingURL=bk-schedule.controller.js.map