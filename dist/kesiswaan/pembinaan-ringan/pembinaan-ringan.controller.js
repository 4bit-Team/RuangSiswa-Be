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
var PembinaanRinganController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PembinaanRinganController = void 0;
const common_1 = require("@nestjs/common");
const pembinaan_ringan_service_1 = require("./pembinaan-ringan.service");
const create_pembinaan_ringan_dto_1 = require("./dto/create-pembinaan-ringan.dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../../auth/decorators/current-user.decorator");
let PembinaanRinganController = PembinaanRinganController_1 = class PembinaanRinganController {
    pembinaanRinganService;
    logger = new common_1.Logger(PembinaanRinganController_1.name);
    constructor(pembinaanRinganService) {
        this.pembinaanRinganService = pembinaanRinganService;
        this.logger.log('✅ PembinaanRinganController initialized');
    }
    async create(createDto) {
        this.logger.log(`📥 POST /api/v1/pembinaan-ringan - Creating for student ${createDto.student_id}`);
        try {
            const result = await this.pembinaanRinganService.create(createDto);
            this.logger.log(`✅ Pembinaan Ringan created successfully`);
            return result;
        }
        catch (error) {
            this.logger.error(`❌ Error creating pembinaan ringan: ${error.message}`);
            throw error;
        }
    }
    async findAll() {
        this.logger.log(`📥 GET /api/v1/pembinaan-ringan`);
        try {
            const result = await this.pembinaanRinganService.findAll();
            this.logger.log(`✅ Retrieved ${result.length} pembinaan ringan records`);
            return result;
        }
        catch (error) {
            this.logger.error(`❌ Error fetching pembinaan ringan: ${error.message}`);
            throw error;
        }
    }
    async findPending(user) {
        this.logger.log(`📥 GET /api/v1/pembinaan-ringan/pending for BK ${user.id}`);
        try {
            const result = await this.pembinaanRinganService.findPendingForCounselor(user.id);
            this.logger.log(`✅ Retrieved ${result.length} pending pembinaan ringan`);
            return result;
        }
        catch (error) {
            this.logger.error(`❌ Error fetching pending pembinaan ringan: ${error.message}`);
            throw error;
        }
    }
    async findOne(id) {
        this.logger.log(`📥 GET /api/v1/pembinaan-ringan/${id}`);
        try {
            const result = await this.pembinaanRinganService.findOne(id);
            return result;
        }
        catch (error) {
            this.logger.error(`❌ Error fetching pembinaan ringan ${id}: ${error.message}`);
            throw error;
        }
    }
    async approve(id, approveDto) {
        this.logger.log(`📥 PATCH /api/v1/pembinaan-ringan/${id}/approve`);
        try {
            const result = await this.pembinaanRinganService.approve(id, approveDto);
            this.logger.log(`✅ Pembinaan Ringan ${id} approved/rejected`);
            return result;
        }
        catch (error) {
            this.logger.error(`❌ Error approving pembinaan ringan ${id}: ${error.message}`);
            throw error;
        }
    }
    async complete(id, completeDto) {
        this.logger.log(`📥 PATCH /api/v1/pembinaan-ringan/${id}/complete`);
        try {
            const result = await this.pembinaanRinganService.complete(id, completeDto);
            this.logger.log(`✅ Pembinaan Ringan ${id} completed`);
            return result;
        }
        catch (error) {
            this.logger.error(`❌ Error completing pembinaan ringan ${id}: ${error.message}`);
            throw error;
        }
    }
    async update(id, updateDto) {
        this.logger.log(`📥 PATCH /api/v1/pembinaan-ringan/${id}`);
        try {
            const result = await this.pembinaanRinganService.update(id, updateDto);
            this.logger.log(`✅ Pembinaan Ringan ${id} updated`);
            return result;
        }
        catch (error) {
            this.logger.error(`❌ Error updating pembinaan ringan ${id}: ${error.message}`);
            throw error;
        }
    }
    async findByStudentId(studentId) {
        this.logger.log(`📥 GET /api/v1/pembinaan-ringan/student/${studentId}`);
        try {
            const result = await this.pembinaanRinganService.findByStudentId(studentId);
            return result;
        }
        catch (error) {
            this.logger.error(`❌ Error fetching pembinaan ringan for student ${studentId}: ${error.message}`);
            throw error;
        }
    }
    async getStatistics() {
        this.logger.log(`📥 GET /api/v1/pembinaan-ringan/stats`);
        try {
            const result = await this.pembinaanRinganService.getStatistics();
            return result;
        }
        catch (error) {
            this.logger.error(`❌ Error fetching statistics: ${error.message}`);
            throw error;
        }
    }
};
exports.PembinaanRinganController = PembinaanRinganController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('kesiswaan', 'admin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_pembinaan_ringan_dto_1.CreatePembinaanRinganDto]),
    __metadata("design:returntype", Promise)
], PembinaanRinganController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'kesiswaan', 'bk'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PembinaanRinganController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('pending'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('bk', 'admin'),
    __param(0, (0, current_user_decorator_1.currentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PembinaanRinganController.prototype, "findPending", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'kesiswaan', 'bk'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PembinaanRinganController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/approve'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('bk', 'admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_pembinaan_ringan_dto_1.ApprovePembinaanRinganDto]),
    __metadata("design:returntype", Promise)
], PembinaanRinganController.prototype, "approve", null);
__decorate([
    (0, common_1.Patch)(':id/complete'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('bk', 'admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_pembinaan_ringan_dto_1.CompletePembinaanRinganDto]),
    __metadata("design:returntype", Promise)
], PembinaanRinganController.prototype, "complete", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('kesiswaan', 'bk', 'admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_pembinaan_ringan_dto_1.UpdatePembinaanRinganDto]),
    __metadata("design:returntype", Promise)
], PembinaanRinganController.prototype, "update", null);
__decorate([
    (0, common_1.Get)('student/:studentId'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'kesiswaan', 'bk'),
    __param(0, (0, common_1.Param)('studentId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PembinaanRinganController.prototype, "findByStudentId", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'kesiswaan'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PembinaanRinganController.prototype, "getStatistics", null);
exports.PembinaanRinganController = PembinaanRinganController = PembinaanRinganController_1 = __decorate([
    (0, common_1.Controller)('v1/pembinaan-ringan'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [pembinaan_ringan_service_1.PembinaanRinganService])
], PembinaanRinganController);
//# sourceMappingURL=pembinaan-ringan.controller.js.map