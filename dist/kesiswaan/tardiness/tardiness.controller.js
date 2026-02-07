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
exports.TardinessController = void 0;
const common_1 = require("@nestjs/common");
const tardiness_service_1 = require("./tardiness.service");
let TardinessController = class TardinessController {
    tardinessService;
    constructor(tardinessService) {
        this.tardinessService = tardinessService;
    }
    async getTardinessRecords(student_id, class_id, status, date_from, date_to, page, limit) {
        try {
            const filters = {
                student_id: student_id ? parseInt(student_id) : undefined,
                class_id: class_id ? parseInt(class_id) : undefined,
                status,
                date_from,
                date_to,
                page: page ? parseInt(page) : 1,
                limit: limit ? parseInt(limit) : 20,
            };
            const result = await this.tardinessService.getTardinessRecords(filters);
            return {
                success: true,
                message: 'Tardiness records retrieved successfully',
                data: result.data,
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    pages: Math.ceil(result.total / result.limit),
                },
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: `Failed to retrieve tardiness records: ${error.message}`,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async submitTardiness(dto) {
        try {
            const record = await this.tardinessService.submitTardiness(dto);
            return {
                success: true,
                message: 'Tardiness record submitted successfully',
                data: record,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: `Failed to submit tardiness: ${error.message}`,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async getTardinessSummary(studentId, month) {
        try {
            const summary = await this.tardinessService.getTardinessSummary(parseInt(studentId), month);
            return {
                success: true,
                message: 'Tardiness summary retrieved successfully',
                data: summary,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: `Failed to retrieve summary: ${error.message}`,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getTardinessHistory(studentId, months) {
        try {
            const history = await this.tardinessService.getTardinessHistory(parseInt(studentId), months ? parseInt(months) : 6);
            return {
                success: true,
                message: 'Tardiness history retrieved successfully',
                data: history,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: `Failed to retrieve history: ${error.message}`,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getStudentAppeals(studentId, status, is_resolved) {
        try {
            const filters = {
                status,
                is_resolved: is_resolved === 'true' ? true : is_resolved === 'false' ? false : undefined,
            };
            const appeals = await this.tardinessService.getStudentAppeals(parseInt(studentId), filters);
            return {
                success: true,
                message: 'Student appeals retrieved successfully',
                data: appeals,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: `Failed to retrieve appeals: ${error.message}`,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async appealTardiness(recordId, dto) {
        try {
            const appeal = await this.tardinessService.appealTardiness({
                tardiness_record_id: recordId,
                alasan_appeal: dto.alasan_appeal,
                bukti_appeal: dto.bukti_appeal,
            });
            return {
                success: true,
                message: 'Tardiness appeal submitted successfully',
                data: appeal,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: `Failed to submit appeal: ${error.message}`,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async reviewAppeal(appealId, dto) {
        try {
            const updatedAppeal = await this.tardinessService.reviewAppeal({
                appeal_id: appealId,
                status: dto.status,
                catatan_bk: dto.catatan_bk,
                resolved_by: dto.resolved_by,
            });
            return {
                success: true,
                message: 'Appeal reviewed successfully',
                data: updatedAppeal,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: `Failed to review appeal: ${error.message}`,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async generateAlerts() {
        try {
            const result = await this.tardinessService.generateTardinessAlerts();
            return {
                success: true,
                message: 'Tardiness alerts generated successfully',
                data: result,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: `Failed to generate alerts: ${error.message}`,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getAlerts(student_id, severity) {
        try {
            const filters = {
                student_id: student_id ? parseInt(student_id) : undefined,
                severity,
            };
            const alerts = await this.tardinessService.getUnresolvedAlerts(filters);
            return {
                success: true,
                message: 'Unresolved alerts retrieved successfully',
                data: alerts,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: `Failed to retrieve alerts: ${error.message}`,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async resolveAlert(alertId, dto) {
        try {
            const alert = await this.tardinessService.resolveAlert(alertId, dto.resolved_by);
            return {
                success: true,
                message: 'Alert resolved successfully',
                data: alert,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: `Failed to resolve alert: ${error.message}`,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async detectPatterns(studentId) {
        try {
            const patterns = await this.tardinessService.detectPatterns(parseInt(studentId));
            return {
                success: true,
                message: 'Tardiness patterns detected successfully',
                data: patterns,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: `Failed to detect patterns: ${error.message}`,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async exportReport(studentId, month) {
        try {
            const report = await this.tardinessService.exportReport(parseInt(studentId), month || new Date().toISOString().slice(0, 7));
            return {
                success: true,
                message: 'Report exported successfully',
                data: report,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: `Failed to export report: ${error.message}`,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.TardinessController = TardinessController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('student_id')),
    __param(1, (0, common_1.Query)('class_id')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('date_from')),
    __param(4, (0, common_1.Query)('date_to')),
    __param(5, (0, common_1.Query)('page')),
    __param(6, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], TardinessController.prototype, "getTardinessRecords", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TardinessController.prototype, "submitTardiness", null);
__decorate([
    (0, common_1.Get)(':studentId/summary'),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, common_1.Query)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TardinessController.prototype, "getTardinessSummary", null);
__decorate([
    (0, common_1.Get)(':studentId/history'),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, common_1.Query)('months')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TardinessController.prototype, "getTardinessHistory", null);
__decorate([
    (0, common_1.Get)(':studentId/appeals'),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('is_resolved')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], TardinessController.prototype, "getStudentAppeals", null);
__decorate([
    (0, common_1.Post)(':recordId/appeal'),
    __param(0, (0, common_1.Param)('recordId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TardinessController.prototype, "appealTardiness", null);
__decorate([
    (0, common_1.Patch)('appeals/:appealId/review'),
    __param(0, (0, common_1.Param)('appealId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TardinessController.prototype, "reviewAppeal", null);
__decorate([
    (0, common_1.Post)('sync'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TardinessController.prototype, "generateAlerts", null);
__decorate([
    (0, common_1.Get)('alerts'),
    __param(0, (0, common_1.Query)('student_id')),
    __param(1, (0, common_1.Query)('severity')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TardinessController.prototype, "getAlerts", null);
__decorate([
    (0, common_1.Patch)('alerts/:alertId/resolve'),
    __param(0, (0, common_1.Param)('alertId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TardinessController.prototype, "resolveAlert", null);
__decorate([
    (0, common_1.Get)(':studentId/patterns'),
    __param(0, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TardinessController.prototype, "detectPatterns", null);
__decorate([
    (0, common_1.Get)(':studentId/export'),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, common_1.Query)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TardinessController.prototype, "exportReport", null);
exports.TardinessController = TardinessController = __decorate([
    (0, common_1.Controller)('v1/kesiswaan/tardiness'),
    __metadata("design:paramtypes", [tardiness_service_1.TardinessService])
], TardinessController);
//# sourceMappingURL=tardiness.controller.js.map