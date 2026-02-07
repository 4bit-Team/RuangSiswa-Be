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
var AttendanceController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceController = void 0;
const common_1 = require("@nestjs/common");
const attendance_service_1 = require("./attendance.service");
let AttendanceController = AttendanceController_1 = class AttendanceController {
    attendanceService;
    logger = new common_1.Logger(AttendanceController_1.name);
    constructor(attendanceService) {
        this.attendanceService = attendanceService;
    }
    async index(studentId, classId, startDate, endDate, page = 1, limit = 20) {
        try {
            const filters = {
                student_id: studentId,
                class_id: classId,
                start_date: startDate ? new Date(startDate) : undefined,
                end_date: endDate ? new Date(endDate) : undefined,
                page,
                limit,
            };
            const result = await this.attendanceService.getAttendanceRecords(filters);
            return {
                success: true,
                message: 'Attendance records retrieved successfully',
                data: result.data,
                pagination: result.pagination,
            };
        }
        catch (error) {
            this.logger.error(`Error fetching attendance: ${error.message}`);
            return {
                success: false,
                message: 'Failed to retrieve attendance records',
                error: error.message,
            };
        }
    }
    async summary(studentId, month) {
        try {
            const summary = await this.attendanceService.getAttendanceSummary(studentId, month);
            return {
                success: true,
                message: 'Attendance summary retrieved successfully',
                data: summary,
            };
        }
        catch (error) {
            this.logger.error(`Error fetching summary: ${error.message}`);
            return {
                success: false,
                message: 'Failed to retrieve attendance summary',
                error: error.message,
            };
        }
    }
    async history(studentId) {
        try {
            const histories = [];
            const now = new Date();
            for (let i = 5; i >= 0; i--) {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const month = date.toISOString().slice(0, 7);
                const summary = await this.attendanceService.getAttendanceSummary(studentId, month);
                histories.push(summary);
            }
            return {
                success: true,
                message: 'Attendance history retrieved successfully',
                data: histories,
            };
        }
        catch (error) {
            this.logger.error(`Error fetching history: ${error.message}`);
            return {
                success: false,
                message: 'Failed to retrieve attendance history',
                error: error.message,
            };
        }
    }
    async sync(body) {
        try {
            const result = await this.attendanceService.syncAttendanceFromWalas(new Date(body.start_date), new Date(body.end_date), body.force_sync || false);
            return {
                success: result.success,
                message: result.success
                    ? 'Sync completed successfully'
                    : 'Sync completed with errors',
                data: result,
            };
        }
        catch (error) {
            this.logger.error(`Error during sync: ${error.message}`);
            return {
                success: false,
                message: 'Failed to sync attendance',
                error: error.message,
            };
        }
    }
    async exportPdf(studentId, month) {
        try {
            const buffer = await this.attendanceService.exportAttendance(studentId, month, 'pdf');
            return {
                success: true,
                message: 'PDF exported successfully',
                data: buffer.toString('base64'),
            };
        }
        catch (error) {
            this.logger.error(`Error exporting PDF: ${error.message}`);
            return {
                success: false,
                message: 'Failed to export PDF',
                error: error.message,
            };
        }
    }
    async exportExcel(classId, month) {
        try {
            return {
                success: false,
                message: 'Feature not yet implemented',
            };
        }
        catch (error) {
            this.logger.error(`Error exporting Excel: ${error.message}`);
            return {
                success: false,
                message: 'Failed to export Excel',
                error: error.message,
            };
        }
    }
    async getAlerts(studentId, severity, resolved = false) {
        try {
            return {
                success: true,
                message: 'Alerts retrieved successfully',
                data: [],
            };
        }
        catch (error) {
            this.logger.error(`Error fetching alerts: ${error.message}`);
            return {
                success: false,
                message: 'Failed to retrieve alerts',
                error: error.message,
            };
        }
    }
    async resolveAlert(alertId, body) {
        try {
            return {
                success: true,
                message: 'Alert resolved successfully',
            };
        }
        catch (error) {
            this.logger.error(`Error resolving alert: ${error.message}`);
            return {
                success: false,
                message: 'Failed to resolve alert',
                error: error.message,
            };
        }
    }
};
exports.AttendanceController = AttendanceController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('student_id')),
    __param(1, (0, common_1.Query)('class_id')),
    __param(2, (0, common_1.Query)('start_date')),
    __param(3, (0, common_1.Query)('end_date')),
    __param(4, (0, common_1.Query)('page')),
    __param(5, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "index", null);
__decorate([
    (0, common_1.Get)(':studentId/summary'),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, common_1.Query)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "summary", null);
__decorate([
    (0, common_1.Get)(':studentId/history'),
    __param(0, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "history", null);
__decorate([
    (0, common_1.Post)('sync'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "sync", null);
__decorate([
    (0, common_1.Get)('export/pdf'),
    __param(0, (0, common_1.Query)('student_id')),
    __param(1, (0, common_1.Query)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "exportPdf", null);
__decorate([
    (0, common_1.Get)('export/excel'),
    __param(0, (0, common_1.Query)('class_id')),
    __param(1, (0, common_1.Query)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "exportExcel", null);
__decorate([
    (0, common_1.Get)('alerts'),
    __param(0, (0, common_1.Query)('student_id')),
    __param(1, (0, common_1.Query)('severity')),
    __param(2, (0, common_1.Query)('resolved')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Object]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getAlerts", null);
__decorate([
    (0, common_1.Patch)('alerts/:alertId/resolve'),
    __param(0, (0, common_1.Param)('alertId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "resolveAlert", null);
exports.AttendanceController = AttendanceController = AttendanceController_1 = __decorate([
    (0, common_1.Controller)('v1/kesiswaan/attendance'),
    __metadata("design:paramtypes", [attendance_service_1.AttendanceService])
], AttendanceController);
//# sourceMappingURL=attendance.controller.js.map