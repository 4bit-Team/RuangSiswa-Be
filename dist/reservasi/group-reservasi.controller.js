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
exports.GroupReservasiController = void 0;
const common_1 = require("@nestjs/common");
const group_reservasi_service_1 = require("./group-reservasi.service");
const create_group_reservasi_dto_1 = require("./dto/create-group-reservasi.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let GroupReservasiController = class GroupReservasiController {
    groupReservasiService;
    constructor(groupReservasiService) {
        this.groupReservasiService = groupReservasiService;
    }
    async create(createGroupReservasiDto, req) {
        console.log('Creating group reservasi:', createGroupReservasiDto);
        return await this.groupReservasiService.create(createGroupReservasiDto);
    }
    async findAll(creatorId, counselorId, status) {
        const filters = {
            creatorId: creatorId ? parseInt(creatorId) : undefined,
            counselorId: counselorId ? parseInt(counselorId) : undefined,
            status,
        };
        return await this.groupReservasiService.findAll(filters);
    }
    async getMyGroupReservations(req) {
        const studentId = req.user.id;
        return await this.groupReservasiService.findByStudentId(studentId);
    }
    async getByStudentId(studentId) {
        return await this.groupReservasiService.findByStudentId(parseInt(studentId));
    }
    async getByCounselorId(req) {
        const counselorId = req.user.id;
        return await this.groupReservasiService.findByCounselorId(counselorId);
    }
    async getPendingGroupReservations(req) {
        const counselorId = req.user.id;
        return await this.groupReservasiService.getPendingForCounselor(counselorId);
    }
    async findOne(id) {
        return await this.groupReservasiService.findOne(parseInt(id));
    }
    async updateStatus(id, updateStatusDto, req) {
        const groupReservasi = await this.groupReservasiService.findOne(parseInt(id));
        if (!groupReservasi) {
            throw new common_1.NotFoundException('Group reservasi tidak ditemukan');
        }
        if (groupReservasi.counselorId !== req.user.id) {
            throw new Error('Hanya konselor yang dapat mengubah status');
        }
        return await this.groupReservasiService.updateStatus(parseInt(id), updateStatusDto);
    }
    async remove(id, req) {
        const groupReservasi = await this.groupReservasiService.findOne(parseInt(id));
        if (!groupReservasi) {
            throw new common_1.NotFoundException('Group reservasi tidak ditemukan');
        }
        if (groupReservasi.creatorId !== req.user.id) {
            throw new Error('Hanya pembuat grup yang dapat menghapus');
        }
        return await this.groupReservasiService.remove(parseInt(id));
    }
};
exports.GroupReservasiController = GroupReservasiController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_group_reservasi_dto_1.CreateGroupReservasiDto, Object]),
    __metadata("design:returntype", Promise)
], GroupReservasiController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('creatorId')),
    __param(1, (0, common_1.Query)('counselorId')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], GroupReservasiController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('student/my-group-reservations'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GroupReservasiController.prototype, "getMyGroupReservations", null);
__decorate([
    (0, common_1.Get)('student/:studentId'),
    __param(0, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GroupReservasiController.prototype, "getByStudentId", null);
__decorate([
    (0, common_1.Get)('counselor/all'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GroupReservasiController.prototype, "getByCounselorId", null);
__decorate([
    (0, common_1.Get)('counselor/pending'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GroupReservasiController.prototype, "getPendingGroupReservations", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GroupReservasiController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_group_reservasi_dto_1.UpdateGroupReservasiStatusDto, Object]),
    __metadata("design:returntype", Promise)
], GroupReservasiController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], GroupReservasiController.prototype, "remove", null);
exports.GroupReservasiController = GroupReservasiController = __decorate([
    (0, common_1.Controller)('reservasi/group'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [group_reservasi_service_1.GroupReservasiService])
], GroupReservasiController);
//# sourceMappingURL=group-reservasi.controller.js.map