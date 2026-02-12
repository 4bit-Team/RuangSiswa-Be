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
exports.LaporanBkController = void 0;
const common_1 = require("@nestjs/common");
const laporan_bk_service_1 = require("./laporan-bk.service");
const create_laporan_bk_dto_1 = require("./dto/create-laporan-bk.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let LaporanBkController = class LaporanBkController {
    laporanBkService;
    constructor(laporanBkService) {
        this.laporanBkService = laporanBkService;
    }
    async create(createDto) {
        return await this.laporanBkService.create(createDto);
    }
    async findAll() {
        return await this.laporanBkService.findAll();
    }
    async getMyLaporan(req) {
        const bk_id = req.user.id;
        return await this.laporanBkService.findByBk(bk_id);
    }
    async getOngoing() {
        return await this.laporanBkService.findOngoing();
    }
    async getPendingFollowUp() {
        return await this.laporanBkService.findPendingFollowUp();
    }
    async getBkStatistics(req) {
        const bk_id = req.user.id;
        return await this.laporanBkService.getBkStatistics(bk_id);
    }
    async getOverallStatistics() {
        return await this.laporanBkService.getOverallStatistics();
    }
    async getByReservasiId(reservasiId) {
        const laporan = await this.laporanBkService.findByReservasiId(parseInt(reservasiId));
        if (!laporan) {
            throw new common_1.NotFoundException(`No laporan found for reservasi ID ${reservasiId}`);
        }
        return laporan;
    }
    async findOne(id) {
        return await this.laporanBkService.findOne(parseInt(id));
    }
    async recordSession(id, recordSessionDto, req) {
        const bk_id = req.user.id;
        return await this.laporanBkService.recordSession(parseInt(id), recordSessionDto, bk_id);
    }
    async markBehavioralImprovement(id, body, req) {
        const bk_id = req.user.id;
        return await this.laporanBkService.markBehavioralImprovement(parseInt(id), body.improved, bk_id);
    }
    async notifyParent(id, body, req) {
        const bk_id = req.user.id;
        return await this.laporanBkService.notifyParent(parseInt(id), body.notification_content, bk_id);
    }
    async completeFollowUp(id, completeDto, req) {
        const bk_id = req.user.id;
        return await this.laporanBkService.completeFollowUp(parseInt(id), completeDto.follow_up_status, bk_id);
    }
    async escalateToWaka(id, escalateDto, req) {
        const bk_id = req.user.id;
        return await this.laporanBkService.escalateToWaka(parseInt(id), escalateDto, bk_id);
    }
    async complete(id, body, req) {
        const bk_id = req.user.id;
        return await this.laporanBkService.complete(parseInt(id), body.final_assessment, bk_id);
    }
    async update(id, updateDto) {
        return await this.laporanBkService.update(parseInt(id), updateDto);
    }
    async archive(id) {
        return await this.laporanBkService.archive(parseInt(id));
    }
};
exports.LaporanBkController = LaporanBkController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('bk', 'admin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_laporan_bk_dto_1.CreateLaporanBkDto]),
    __metadata("design:returntype", Promise)
], LaporanBkController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'kesiswaan'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LaporanBkController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('my-laporan'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('bk'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LaporanBkController.prototype, "getMyLaporan", null);
__decorate([
    (0, common_1.Get)('status/ongoing'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LaporanBkController.prototype, "getOngoing", null);
__decorate([
    (0, common_1.Get)('follow-up/pending'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LaporanBkController.prototype, "getPendingFollowUp", null);
__decorate([
    (0, common_1.Get)('statistics/bk'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('bk', 'admin'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LaporanBkController.prototype, "getBkStatistics", null);
__decorate([
    (0, common_1.Get)('statistics/overall'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LaporanBkController.prototype, "getOverallStatistics", null);
__decorate([
    (0, common_1.Get)('by-reservasi/:reservasiId'),
    __param(0, (0, common_1.Param)('reservasiId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LaporanBkController.prototype, "getByReservasiId", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LaporanBkController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/session'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('bk'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_laporan_bk_dto_1.RecordSessionDto, Object]),
    __metadata("design:returntype", Promise)
], LaporanBkController.prototype, "recordSession", null);
__decorate([
    (0, common_1.Patch)(':id/behavioral-improvement'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('bk'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], LaporanBkController.prototype, "markBehavioralImprovement", null);
__decorate([
    (0, common_1.Patch)(':id/notify-parent'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('bk'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], LaporanBkController.prototype, "notifyParent", null);
__decorate([
    (0, common_1.Patch)(':id/follow-up/complete'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('bk'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_laporan_bk_dto_1.CompleteFollowUpDto, Object]),
    __metadata("design:returntype", Promise)
], LaporanBkController.prototype, "completeFollowUp", null);
__decorate([
    (0, common_1.Patch)(':id/escalate-to-waka'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('bk'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_laporan_bk_dto_1.EscalateToBkDto, Object]),
    __metadata("design:returntype", Promise)
], LaporanBkController.prototype, "escalateToWaka", null);
__decorate([
    (0, common_1.Patch)(':id/complete'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('bk'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], LaporanBkController.prototype, "complete", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('bk', 'admin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_laporan_bk_dto_1.UpdateLaporanBkDto]),
    __metadata("design:returntype", Promise)
], LaporanBkController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/archive'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('bk', 'admin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LaporanBkController.prototype, "archive", null);
exports.LaporanBkController = LaporanBkController = __decorate([
    (0, common_1.Controller)('laporan-bk'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [laporan_bk_service_1.LaporanBkService])
], LaporanBkController);
//# sourceMappingURL=laporan-bk.controller.js.map