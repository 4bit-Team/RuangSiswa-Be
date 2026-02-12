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
exports.PembinaanWakaController = void 0;
const common_1 = require("@nestjs/common");
const pembinaan_waka_service_1 = require("./pembinaan-waka.service");
const create_pembinaan_waka_dto_1 = require("./dto/create-pembinaan-waka.dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
let PembinaanWakaController = class PembinaanWakaController {
    pembinaanWakaService;
    constructor(pembinaanWakaService) {
        this.pembinaanWakaService = pembinaanWakaService;
    }
    async create(createDto) {
        return await this.pembinaanWakaService.create(createDto);
    }
    async findAll() {
        return await this.pembinaanWakaService.findAll();
    }
    async getPendingForWaka(req) {
        const waka_id = req.user.id;
        return await this.pembinaanWakaService.getPendingForWaka(waka_id);
    }
    async getStatistics(req) {
        const waka_id = req.user.id;
        return await this.pembinaanWakaService.getWakaStatistics(waka_id);
    }
    async findOne(id) {
        return await this.pembinaanWakaService.findOne(parseInt(id));
    }
    async makeDecision(id, decideDto, req) {
        const waka_id = req.user.id;
        return await this.pembinaanWakaService.makeDecision(parseInt(id), decideDto, waka_id);
    }
    async acknowledgeDecision(id, acknowledgeDto, req) {
        const student_id = req.user.id;
        return await this.pembinaanWakaService.studentAcknowledge(parseInt(id), acknowledgeDto, student_id);
    }
    async executeDecision(id, body, req) {
        const waka_id = req.user.id;
        return await this.pembinaanWakaService.markAsExecuted(parseInt(id), waka_id, body.execution_notes);
    }
    async submitAppeal(id, appealDto, req) {
        const student_id = req.user.id;
        return await this.pembinaanWakaService.submitAppeal(parseInt(id), appealDto, student_id);
    }
    async decideOnAppeal(id, body, req) {
        const waka_id = req.user.id;
        return await this.pembinaanWakaService.decideOnAppeal(parseInt(id), body.appeal_decision, waka_id);
    }
    async update(id, updateDto) {
        return await this.pembinaanWakaService.update(parseInt(id), updateDto);
    }
};
exports.PembinaanWakaController = PembinaanWakaController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('kesiswaan', 'admin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_pembinaan_waka_dto_1.CreatePembinaanWakaDto]),
    __metadata("design:returntype", Promise)
], PembinaanWakaController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PembinaanWakaController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('pending'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('waka', 'admin'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PembinaanWakaController.prototype, "getPendingForWaka", null);
__decorate([
    (0, common_1.Get)('statistics'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('waka', 'admin'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PembinaanWakaController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PembinaanWakaController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/execute'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('waka', 'admin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_pembinaan_waka_dto_1.DecidePembinaanWakaDto, Object]),
    __metadata("design:returntype", Promise)
], PembinaanWakaController.prototype, "makeDecision", null);
__decorate([
    (0, common_1.Patch)(':id/acknowledge'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_pembinaan_waka_dto_1.AcknowledgePembinaanWakaDto, Object]),
    __metadata("design:returntype", Promise)
], PembinaanWakaController.prototype, "acknowledgeDecision", null);
__decorate([
    (0, common_1.Patch)(':id/executed'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('waka', 'admin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PembinaanWakaController.prototype, "executeDecision", null);
__decorate([
    (0, common_1.Patch)(':id/appeal'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_pembinaan_waka_dto_1.AppealPembinaanWakaDto, Object]),
    __metadata("design:returntype", Promise)
], PembinaanWakaController.prototype, "submitAppeal", null);
__decorate([
    (0, common_1.Patch)(':id/decide-appeal'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('waka', 'admin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PembinaanWakaController.prototype, "decideOnAppeal", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('waka', 'kesiswaan', 'admin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_pembinaan_waka_dto_1.UpdatePembinaanWakaDto]),
    __metadata("design:returntype", Promise)
], PembinaanWakaController.prototype, "update", null);
exports.PembinaanWakaController = PembinaanWakaController = __decorate([
    (0, common_1.Controller)('v1/pembinaan-waka'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [pembinaan_waka_service_1.PembinaanWakaService])
], PembinaanWakaController);
//# sourceMappingURL=pembinaan-waka.controller.js.map