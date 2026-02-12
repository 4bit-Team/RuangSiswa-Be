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
exports.ToxicFilterController = void 0;
const common_1 = require("@nestjs/common");
const toxic_filter_service_1 = require("./toxic-filter.service");
const create_toxic_filter_dto_1 = require("./dto/create-toxic-filter.dto");
const update_toxic_filter_dto_1 = require("./dto/update-toxic-filter.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let ToxicFilterController = class ToxicFilterController {
    toxicFilterService;
    constructor(toxicFilterService) {
        this.toxicFilterService = toxicFilterService;
    }
    async getAllFilters() {
        return await this.toxicFilterService.findAll();
    }
    async getStatistics() {
        return await this.toxicFilterService.getStatistics();
    }
    async getFilterById(id) {
        const filter = await this.toxicFilterService.findById(id);
        if (!filter) {
            throw new common_1.NotFoundException('Filter not found');
        }
        return filter;
    }
    async createFilter(dto) {
        const existing = await this.toxicFilterService.findByWord(dto.word);
        if (existing) {
            throw new common_1.BadRequestException('Filter word already exists');
        }
        return await this.toxicFilterService.create(dto);
    }
    async updateFilter(id, dto) {
        const filter = await this.toxicFilterService.findById(id);
        if (!filter) {
            throw new common_1.NotFoundException('Filter not found');
        }
        if (dto.word && dto.word.toLowerCase() !== filter.word) {
            const existing = await this.toxicFilterService.findByWord(dto.word);
            if (existing) {
                throw new common_1.BadRequestException('Filter word already exists');
            }
        }
        return await this.toxicFilterService.update(id, dto);
    }
    async deleteFilter(id) {
        const filter = await this.toxicFilterService.findById(id);
        if (!filter) {
            throw new common_1.NotFoundException('Filter not found');
        }
        await this.toxicFilterService.delete(id);
        return { message: 'Filter deleted successfully' };
    }
};
exports.ToxicFilterController = ToxicFilterController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ToxicFilterController.prototype, "getAllFilters", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ToxicFilterController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ToxicFilterController.prototype, "getFilterById", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_toxic_filter_dto_1.CreateToxicFilterDto]),
    __metadata("design:returntype", Promise)
], ToxicFilterController.prototype, "createFilter", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_toxic_filter_dto_1.UpdateToxicFilterDto]),
    __metadata("design:returntype", Promise)
], ToxicFilterController.prototype, "updateFilter", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ToxicFilterController.prototype, "deleteFilter", null);
exports.ToxicFilterController = ToxicFilterController = __decorate([
    (0, common_1.Controller)('toxic-filters'),
    __metadata("design:paramtypes", [toxic_filter_service_1.ToxicFilterService])
], ToxicFilterController);
//# sourceMappingURL=toxic-filter.controller.js.map