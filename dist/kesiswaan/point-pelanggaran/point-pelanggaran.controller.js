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
exports.PointPelanggaranController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const point_pelanggaran_service_1 = require("./point-pelanggaran.service");
const create_point_pelanggaran_dto_1 = require("./dto/create-point-pelanggaran.dto");
const update_point_pelanggaran_dto_1 = require("./dto/update-point-pelanggaran.dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
let PointPelanggaranController = class PointPelanggaranController {
    pointPelanggaranService;
    constructor(pointPelanggaranService) {
        this.pointPelanggaranService = pointPelanggaranService;
    }
    async getCategories() {
        return await this.pointPelanggaranService.getCategories();
    }
    async getByCategory(category, tahun) {
        const tahunPoint = tahun ? parseInt(tahun) : undefined;
        return await this.pointPelanggaranService.findByCategory(category, tahunPoint);
    }
    async getSummaryByCategory() {
        return await this.pointPelanggaranService.getSummaryByCategory();
    }
    async findAll(tahun, isActive) {
        const tahunPoint = tahun ? parseInt(tahun) : undefined;
        const isActiveFilter = isActive === undefined ? undefined : isActive === 'true';
        return await this.pointPelanggaranService.findAll(tahunPoint, isActiveFilter);
    }
    async findByYear(tahun) {
        return await this.pointPelanggaranService.findByYear(tahun);
    }
    async findActive() {
        return await this.pointPelanggaranService.findActive();
    }
    async findSanksi(tahun) {
        const tahunPoint = tahun ? parseInt(tahun) : undefined;
        return await this.pointPelanggaranService.findSanksi(tahunPoint);
    }
    async findDoMutasi(tahun) {
        const tahunPoint = tahun ? parseInt(tahun) : undefined;
        return await this.pointPelanggaranService.findDoMutasi(tahunPoint);
    }
    async getSummary() {
        return await this.pointPelanggaranService.getSummaryByYear();
    }
    async importPdf(file) {
        if (!file) {
            throw new common_1.BadRequestException('File PDF harus diunggah');
        }
        if (!file.mimetype.includes('pdf')) {
            throw new common_1.BadRequestException('File harus berformat PDF');
        }
        return await this.pointPelanggaranService.importPointsFromPdf(file.buffer);
    }
    async calculateBobot(kodes) {
        if (!Array.isArray(kodes)) {
            throw new common_1.BadRequestException('kodes harus berupa array');
        }
        const total = await this.pointPelanggaranService.calculateTotalBobot(kodes);
        return { kodes, total };
    }
    async findById(id) {
        return await this.pointPelanggaranService.findById(id);
    }
    async create(dto) {
        return await this.pointPelanggaranService.create(dto);
    }
    async update(id, dto) {
        return await this.pointPelanggaranService.update(id, dto);
    }
    async setActive(id) {
        return await this.pointPelanggaranService.setActive(id);
    }
    async setInactive(id) {
        return await this.pointPelanggaranService.setInactive(id);
    }
    async delete(id) {
        await this.pointPelanggaranService.delete(id);
        return { message: 'Point pelanggaran berhasil dihapus' };
    }
};
exports.PointPelanggaranController = PointPelanggaranController;
__decorate([
    (0, common_1.Get)('categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PointPelanggaranController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Get)('category/:category'),
    __param(0, (0, common_1.Param)('category')),
    __param(1, (0, common_1.Query)('tahun')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PointPelanggaranController.prototype, "getByCategory", null);
__decorate([
    (0, common_1.Get)('summary/category'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PointPelanggaranController.prototype, "getSummaryByCategory", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('tahun')),
    __param(1, (0, common_1.Query)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PointPelanggaranController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('year/:tahun'),
    __param(0, (0, common_1.Param)('tahun', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PointPelanggaranController.prototype, "findByYear", null);
__decorate([
    (0, common_1.Get)('active'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PointPelanggaranController.prototype, "findActive", null);
__decorate([
    (0, common_1.Get)('sanksi'),
    __param(0, (0, common_1.Query)('tahun')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PointPelanggaranController.prototype, "findSanksi", null);
__decorate([
    (0, common_1.Get)('do-mutasi'),
    __param(0, (0, common_1.Query)('tahun')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PointPelanggaranController.prototype, "findDoMutasi", null);
__decorate([
    (0, common_1.Get)('summary'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PointPelanggaranController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Post)('import-pdf'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'KESISWAAN'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PointPelanggaranController.prototype, "importPdf", null);
__decorate([
    (0, common_1.Post)('calculate-bobot'),
    __param(0, (0, common_1.Body)('kodes')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], PointPelanggaranController.prototype, "calculateBobot", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PointPelanggaranController.prototype, "findById", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'KESISWAAN'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_point_pelanggaran_dto_1.CreatePointPelanggaranDto]),
    __metadata("design:returntype", Promise)
], PointPelanggaranController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'KESISWAAN'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_point_pelanggaran_dto_1.UpdatePointPelanggaranDto]),
    __metadata("design:returntype", Promise)
], PointPelanggaranController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/set-active'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'KESISWAAN'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PointPelanggaranController.prototype, "setActive", null);
__decorate([
    (0, common_1.Patch)(':id/set-inactive'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'KESISWAAN'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PointPelanggaranController.prototype, "setInactive", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'KESISWAAN'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PointPelanggaranController.prototype, "delete", null);
exports.PointPelanggaranController = PointPelanggaranController = __decorate([
    (0, common_1.Controller)('point-pelanggaran'),
    __metadata("design:paramtypes", [point_pelanggaran_service_1.PointPelanggaranService])
], PointPelanggaranController);
//# sourceMappingURL=point-pelanggaran.controller.js.map