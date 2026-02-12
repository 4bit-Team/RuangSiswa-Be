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
var PembinaanOrtuController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PembinaanOrtuController = void 0;
const common_1 = require("@nestjs/common");
const pembinaan_ortu_service_1 = require("./pembinaan-ortu.service");
const create_pembinaan_ortu_dto_1 = require("./dto/create-pembinaan-ortu.dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../../auth/decorators/current-user.decorator");
let PembinaanOrtuController = PembinaanOrtuController_1 = class PembinaanOrtuController {
    pembinaanOrtuService;
    logger = new common_1.Logger(PembinaanOrtuController_1.name);
    constructor(pembinaanOrtuService) {
        this.pembinaanOrtuService = pembinaanOrtuService;
        this.logger.log('✅ PembinaanOrtuController initialized');
    }
    async create(createDto) {
        this.logger.log(`📥 POST /api/v1/pembinaan-ortu - Creating for student ${createDto.student_id}`);
        try {
            const result = await this.pembinaanOrtuService.create(createDto);
            this.logger.log(`✅ Pembinaan Ortu created successfully`);
            return result;
        }
        catch (error) {
            this.logger.error(`❌ Error creating pembinaan ortu: ${error.message}`);
            throw error;
        }
    }
    async findAll() {
        this.logger.log(`📥 GET /api/v1/pembinaan-ortu`);
        try {
            const result = await this.pembinaanOrtuService.findAll();
            this.logger.log(`✅ Retrieved ${result.length} pembinaan ortu records`);
            return result;
        }
        catch (error) {
            this.logger.error(`❌ Error fetching pembinaan ortu: ${error.message}`);
            throw error;
        }
    }
    async findByParentId(parentId, user) {
        this.logger.log(`📥 GET /api/v1/pembinaan-ortu/parent/${parentId}`);
        try {
            const result = await this.pembinaanOrtuService.findByParentId(parentId);
            this.logger.log(`✅ Retrieved ${result.length} pembinaan ortu for parent`);
            return result;
        }
        catch (error) {
            this.logger.error(`❌ Error fetching pembinaan ortu for parent: ${error.message}`);
            throw error;
        }
    }
    async findOne(id) {
        this.logger.log(`📥 GET /api/v1/pembinaan-ortu/${id}`);
        try {
            const result = await this.pembinaanOrtuService.findOne(id);
            return result;
        }
        catch (error) {
            this.logger.error(`❌ Error fetching pembinaan ortu ${id}: ${error.message}`);
            throw error;
        }
    }
    async update(id, updateDto) {
        this.logger.log(`📥 PATCH /api/v1/pembinaan-ortu/${id}`);
        try {
            const result = await this.pembinaanOrtuService.update(id, updateDto);
            this.logger.log(`✅ Pembinaan Ortu ${id} updated`);
            return result;
        }
        catch (error) {
            this.logger.error(`❌ Error updating pembinaan ortu ${id}: ${error.message}`);
            throw error;
        }
    }
    async sendLetter(id, sendDto) {
        this.logger.log(`📥 POST /api/v1/pembinaan-ortu/${id}/send-letter`);
        try {
            const result = await this.pembinaanOrtuService.sendLetter(id, sendDto);
            this.logger.log(`✅ Letter sent for Pembinaan Ortu ${id}`);
            return result;
        }
        catch (error) {
            this.logger.error(`❌ Error sending letter: ${error.message}`);
            throw error;
        }
    }
    async recordParentResponse(id, respondDto) {
        this.logger.log(`📥 POST /api/v1/pembinaan-ortu/${id}/parent-response`);
        try {
            const result = await this.pembinaanOrtuService.recordParentResponse(id, respondDto);
            this.logger.log(`✅ Parent response recorded`);
            return result;
        }
        catch (error) {
            this.logger.error(`❌ Error recording parent response: ${error.message}`);
            throw error;
        }
    }
    async recordMeeting(id, recordDto) {
        this.logger.log(`📥 POST /api/v1/pembinaan-ortu/${id}/record-meeting`);
        try {
            const result = await this.pembinaanOrtuService.recordMeeting(id, recordDto);
            this.logger.log(`✅ Meeting recorded`);
            return result;
        }
        catch (error) {
            this.logger.error(`❌ Error recording meeting: ${error.message}`);
            throw error;
        }
    }
    async getPendingLetters() {
        this.logger.log(`📥 GET /api/v1/pembinaan-ortu/pending/letters`);
        try {
            const result = await this.pembinaanOrtuService.getPendingLetters();
            this.logger.log(`✅ Retrieved ${result.length} pending letters`);
            return result;
        }
        catch (error) {
            this.logger.error(`❌ Error fetching pending letters: ${error.message}`);
            throw error;
        }
    }
    async getStatistics() {
        this.logger.log(`📥 GET /api/v1/pembinaan-ortu/stats`);
        try {
            const result = await this.pembinaanOrtuService.getStatistics();
            return result;
        }
        catch (error) {
            this.logger.error(`❌ Error fetching statistics: ${error.message}`);
            throw error;
        }
    }
    async findByStudentId(studentId) {
        this.logger.log(`📥 GET /api/v1/pembinaan-ortu/student/${studentId}`);
        try {
            const result = await this.pembinaanOrtuService.findByStudentId(studentId);
            return result;
        }
        catch (error) {
            this.logger.error(`❌ Error fetching pembinaan ortu for student: ${error.message}`);
            throw error;
        }
    }
};
exports.PembinaanOrtuController = PembinaanOrtuController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('kesiswaan', 'admin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_pembinaan_ortu_dto_1.CreatePembinaanOrtuDto]),
    __metadata("design:returntype", Promise)
], PembinaanOrtuController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'kesiswaan'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PembinaanOrtuController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('parent/:parentId'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('orang_tua', 'admin'),
    __param(0, (0, common_1.Param)('parentId', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.currentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PembinaanOrtuController.prototype, "findByParentId", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'kesiswaan', 'orang_tua'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PembinaanOrtuController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('kesiswaan', 'admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_pembinaan_ortu_dto_1.UpdatePembinaanOrtuDto]),
    __metadata("design:returntype", Promise)
], PembinaanOrtuController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/send-letter'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('kesiswaan', 'admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_pembinaan_ortu_dto_1.SendLetterDto]),
    __metadata("design:returntype", Promise)
], PembinaanOrtuController.prototype, "sendLetter", null);
__decorate([
    (0, common_1.Post)(':id/parent-response'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('orang_tua', 'admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_pembinaan_ortu_dto_1.RespondFromParentDto]),
    __metadata("design:returntype", Promise)
], PembinaanOrtuController.prototype, "recordParentResponse", null);
__decorate([
    (0, common_1.Post)(':id/record-meeting'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('kesiswaan', 'admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_pembinaan_ortu_dto_1.RecordMeetingDto]),
    __metadata("design:returntype", Promise)
], PembinaanOrtuController.prototype, "recordMeeting", null);
__decorate([
    (0, common_1.Get)('pending/letters'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('kesiswaan', 'admin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PembinaanOrtuController.prototype, "getPendingLetters", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'kesiswaan'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PembinaanOrtuController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)('student/:studentId'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'kesiswaan'),
    __param(0, (0, common_1.Param)('studentId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PembinaanOrtuController.prototype, "findByStudentId", null);
exports.PembinaanOrtuController = PembinaanOrtuController = PembinaanOrtuController_1 = __decorate([
    (0, common_1.Controller)('v1/pembinaan-ortu'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [pembinaan_ortu_service_1.PembinaanOrtuService])
], PembinaanOrtuController);
//# sourceMappingURL=pembinaan-ortu.controller.js.map