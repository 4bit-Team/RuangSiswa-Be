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
exports.BkJurusanController = void 0;
const common_1 = require("@nestjs/common");
const bk_jurusan_service_1 = require("./bk-jurusan.service");
const create_bk_jurusan_dto_1 = require("./dto/create-bk-jurusan.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let BkJurusanController = class BkJurusanController {
    bkJurusanService;
    constructor(bkJurusanService) {
        this.bkJurusanService = bkJurusanService;
    }
    async getMyJurusan(req) {
        const bkId = req.user.id;
        console.log('📖 Getting jurusan list for BK:', bkId);
        return await this.bkJurusanService.getJurusanByBkId(bkId);
    }
    async addJurusan(jurusanId, req) {
        const bkId = req.user.id;
        const jurusanIdNum = parseInt(jurusanId, 10);
        if (isNaN(jurusanIdNum)) {
            throw new common_1.BadRequestException('Invalid jurusanId');
        }
        console.log('📝 Adding jurusan', jurusanIdNum, 'to BK:', bkId);
        return await this.bkJurusanService.addJurusan(bkId, jurusanIdNum);
    }
    async removeJurusan(jurusanId, req) {
        const bkId = req.user.id;
        const jurusanIdNum = parseInt(jurusanId, 10);
        if (isNaN(jurusanIdNum)) {
            throw new common_1.BadRequestException('Invalid jurusanId');
        }
        console.log('🗑️ Removing jurusan', jurusanIdNum, 'from BK:', bkId);
        return await this.bkJurusanService.removeJurusan(bkId, jurusanIdNum);
    }
    async updateJurusanList(updateDto, req) {
        const bkId = req.user.id;
        if (!Array.isArray(updateDto.jurusanIds)) {
            throw new common_1.BadRequestException('jurusanIds must be an array');
        }
        console.log('📝 Updating jurusan list for BK:', bkId, 'with:', updateDto.jurusanIds);
        return await this.bkJurusanService.updateJurusanList(bkId, updateDto.jurusanIds);
    }
    async isConfigured(req) {
        const bkId = req.user.id;
        const isConfigured = await this.bkJurusanService.hasBkConfiguredAnyJurusan(bkId);
        return { isConfigured };
    }
    async getBKsByJurusan(jurusanId) {
        const jurusanIdNum = parseInt(jurusanId, 10);
        if (isNaN(jurusanIdNum)) {
            throw new common_1.BadRequestException('Invalid jurusanId');
        }
        console.log('📖 Getting BK list for jurusan:', jurusanIdNum);
        return await this.bkJurusanService.getBKsByJurusanId(jurusanIdNum);
    }
};
exports.BkJurusanController = BkJurusanController;
__decorate([
    (0, common_1.Get)('my-jurusan'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BkJurusanController.prototype, "getMyJurusan", null);
__decorate([
    (0, common_1.Post)('add/:jurusanId'),
    __param(0, (0, common_1.Param)('jurusanId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BkJurusanController.prototype, "addJurusan", null);
__decorate([
    (0, common_1.Delete)('remove/:jurusanId'),
    __param(0, (0, common_1.Param)('jurusanId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BkJurusanController.prototype, "removeJurusan", null);
__decorate([
    (0, common_1.Put)('update-list'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_bk_jurusan_dto_1.UpdateBkJurusanDto, Object]),
    __metadata("design:returntype", Promise)
], BkJurusanController.prototype, "updateJurusanList", null);
__decorate([
    (0, common_1.Get)('is-configured'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BkJurusanController.prototype, "isConfigured", null);
__decorate([
    (0, common_1.Get)('by-jurusan/:jurusanId'),
    __param(0, (0, common_1.Param)('jurusanId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BkJurusanController.prototype, "getBKsByJurusan", null);
exports.BkJurusanController = BkJurusanController = __decorate([
    (0, common_1.Controller)('bk-jurusan'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [bk_jurusan_service_1.BkJurusanService])
], BkJurusanController);
//# sourceMappingURL=bk-jurusan.controller.js.map