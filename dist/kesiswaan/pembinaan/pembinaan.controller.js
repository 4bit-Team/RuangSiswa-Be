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
var PembinaanController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PembinaanController = void 0;
const common_1 = require("@nestjs/common");
const pembinaan_service_1 = require("./pembinaan.service");
const sync_pembinaan_dto_1 = require("./dto/sync-pembinaan.dto");
const update_pembinaan_dto_1 = require("./dto/update-pembinaan.dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
let PembinaanController = PembinaanController_1 = class PembinaanController {
    pembinaanService;
    logger = new common_1.Logger(PembinaanController_1.name);
    constructor(pembinaanService) {
        this.pembinaanService = pembinaanService;
        this.logger.log('✅ PembinaanController initialized');
    }
    async findAll(status, siswas_id, walas_id) {
        const filters = {
            status,
            siswas_id: siswas_id ? parseInt(siswas_id) : undefined,
            walas_id: walas_id ? parseInt(walas_id) : undefined,
        };
        this.logger.log('📥 GET /api/v1/pembinaan called with filters:', JSON.stringify(filters));
        try {
            const result = await this.pembinaanService.findAll(filters);
            this.logger.log(`✅ Successfully retrieved ${result.length} pembinaan records`);
            return result;
        }
        catch (error) {
            this.logger.error(`❌ Error in findAll: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getStatistics(startDate, endDate, siswas_id, walas_id) {
        const filters = {
            startDate,
            endDate,
            siswas_id: siswas_id ? parseInt(siswas_id) : undefined,
            walas_id: walas_id ? parseInt(walas_id) : undefined,
        };
        return await this.pembinaanService.getStatistics(filters);
    }
    async getWalasStatistics(class_id, walas_id, start_date, end_date) {
        const filters = {
            class_id: class_id ? parseInt(class_id) : undefined,
            walas_id: walas_id ? parseInt(walas_id) : undefined,
            start_date,
            end_date,
        };
        return await this.pembinaanService.getWalasStatistics(filters);
    }
    async getUnmatched() {
        return await this.pembinaanService.getUnmatched();
    }
    async search(query) {
        if (!query || query.length < 2) {
            throw new common_1.BadRequestException('Query parameter must be at least 2 characters');
        }
        return await this.pembinaanService.search(query);
    }
    async findById(id) {
        return await this.pembinaanService.findById(id);
    }
    async findByStudent(siswas_id) {
        return await this.pembinaanService.findByStudent(siswas_id);
    }
    async findByWalas(walas_id) {
        return await this.pembinaanService.findByWalas(walas_id);
    }
    async fetchAndSyncFromWalas(class_id, walas_id, student_id) {
        const filters = {
            class_id: class_id ? parseInt(class_id) : undefined,
            walas_id: walas_id ? parseInt(walas_id) : undefined,
            student_id: student_id ? parseInt(student_id) : undefined,
        };
        this.logger.log('📥 POST /api/v1/pembinaan/fetch-sync called with filters:', JSON.stringify(filters));
        try {
            const result = await this.pembinaanService.fetchAndSyncFromWalas(filters);
            this.logger.log(`✅ Fetch-sync complete: Synced=${result.synced}, Skipped=${result.skipped}, Errors=${result.errors.length}`);
            return result;
        }
        catch (error) {
            this.logger.error(`❌ Error in fetchAndSyncFromWalas: ${error.message}`, error.stack);
            throw error;
        }
    }
    async syncFromWalas(dto) {
        if (!dto.kasus || !dto.tindak_lanjut) {
            throw new common_1.BadRequestException('kasus dan tindak_lanjut harus diisi');
        }
        return await this.pembinaanService.syncFromWalas(dto);
    }
    async update(id, dto) {
        return await this.pembinaanService.update(id, dto);
    }
    async assignPoint(id, point_pelanggaran_id) {
        if (!point_pelanggaran_id) {
            throw new common_1.BadRequestException('point_pelanggaran_id harus diisi');
        }
        return await this.pembinaanService.update(id, {
            point_pelanggaran_id,
        });
    }
    async bulkUpdateStatus(ids, status) {
        if (!Array.isArray(ids) || ids.length === 0) {
            throw new common_1.BadRequestException('ids harus berupa array yang tidak kosong');
        }
        if (!status) {
            throw new common_1.BadRequestException('status harus diisi');
        }
        await this.pembinaanService.updateStatus(ids, status);
        return { message: `${ids.length} pembinaan records updated`, status };
    }
    async delete(id) {
        await this.pembinaanService.delete(id);
        return { message: 'Pembinaan berhasil dihapus' };
    }
};
exports.PembinaanController = PembinaanController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('siswas_id')),
    __param(2, (0, common_1.Query)('walas_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PembinaanController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Query)('siswas_id')),
    __param(3, (0, common_1.Query)('walas_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], PembinaanController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)('walas-stats'),
    __param(0, (0, common_1.Query)('class_id')),
    __param(1, (0, common_1.Query)('walas_id')),
    __param(2, (0, common_1.Query)('start_date')),
    __param(3, (0, common_1.Query)('end_date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], PembinaanController.prototype, "getWalasStatistics", null);
__decorate([
    (0, common_1.Get)('unmatched'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PembinaanController.prototype, "getUnmatched", null);
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PembinaanController.prototype, "search", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PembinaanController.prototype, "findById", null);
__decorate([
    (0, common_1.Get)('student/:siswas_id'),
    __param(0, (0, common_1.Param)('siswas_id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PembinaanController.prototype, "findByStudent", null);
__decorate([
    (0, common_1.Get)('walas/:walas_id'),
    __param(0, (0, common_1.Param)('walas_id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PembinaanController.prototype, "findByWalas", null);
__decorate([
    (0, common_1.Post)('fetch-sync'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'KESISWAAN'),
    __param(0, (0, common_1.Query)('class_id')),
    __param(1, (0, common_1.Query)('walas_id')),
    __param(2, (0, common_1.Query)('student_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PembinaanController.prototype, "fetchAndSyncFromWalas", null);
__decorate([
    (0, common_1.Post)('sync'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'KESISWAAN'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sync_pembinaan_dto_1.SyncPembinaanDto]),
    __metadata("design:returntype", Promise)
], PembinaanController.prototype, "syncFromWalas", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'KESISWAAN', 'BK'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_pembinaan_dto_1.UpdatePembinaanDto]),
    __metadata("design:returntype", Promise)
], PembinaanController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/assign-point'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'KESISWAAN', 'BK'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('point_pelanggaran_id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], PembinaanController.prototype, "assignPoint", null);
__decorate([
    (0, common_1.Patch)('bulk/status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'KESISWAAN'),
    __param(0, (0, common_1.Body)('ids', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, String]),
    __metadata("design:returntype", Promise)
], PembinaanController.prototype, "bulkUpdateStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'KESISWAAN'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PembinaanController.prototype, "delete", null);
exports.PembinaanController = PembinaanController = PembinaanController_1 = __decorate([
    (0, common_1.Controller)('v1/pembinaan'),
    __metadata("design:paramtypes", [pembinaan_service_1.PembinaanService])
], PembinaanController);
//# sourceMappingURL=pembinaan.controller.js.map