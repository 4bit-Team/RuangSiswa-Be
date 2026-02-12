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
exports.BkJurusanService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bk_jurusan_entity_1 = require("./entities/bk-jurusan.entity");
const user_entity_1 = require("../users/entities/user.entity");
let BkJurusanService = class BkJurusanService {
    bkJurusanRepository;
    userRepository;
    constructor(bkJurusanRepository, userRepository) {
        this.bkJurusanRepository = bkJurusanRepository;
        this.userRepository = userRepository;
    }
    async addJurusan(bkId, jurusanId) {
        const existing = await this.bkJurusanRepository.findOne({
            where: { bkId, jurusanId },
        });
        if (existing) {
            return existing;
        }
        const bkJurusan = this.bkJurusanRepository.create({
            bkId,
            jurusanId,
        });
        return await this.bkJurusanRepository.save(bkJurusan);
    }
    async getJurusanByBkId(bkId) {
        return await this.bkJurusanRepository.find({
            where: { bkId },
            relations: ['jurusan'],
            order: { createdAt: 'ASC' },
        });
    }
    async updateJurusanList(bkId, jurusanIds) {
        await this.bkJurusanRepository.delete({ bkId });
        if (jurusanIds && jurusanIds.length > 0) {
            const assignments = jurusanIds.map((jurusanId) => this.bkJurusanRepository.create({ bkId, jurusanId }));
            await this.bkJurusanRepository.save(assignments);
        }
        return await this.getJurusanByBkId(bkId);
    }
    async removeJurusan(bkId, jurusanId) {
        const result = await this.bkJurusanRepository.delete({
            bkId,
            jurusanId,
        });
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`BK Jurusan assignment not found for BK ${bkId} and Jurusan ${jurusanId}`);
        }
        return { success: true };
    }
    async hasJurusan(bkId, jurusanId) {
        const assignment = await this.bkJurusanRepository.findOne({
            where: { bkId, jurusanId },
        });
        return !!assignment;
    }
    async getBKsByJurusanId(jurusanId) {
        return await this.bkJurusanRepository.find({
            where: { jurusanId },
            relations: ['bk'],
        });
    }
    async hasBkConfiguredAnyJurusan(bkId) {
        const count = await this.bkJurusanRepository.count({
            where: { bkId },
        });
        return count > 0;
    }
};
exports.BkJurusanService = BkJurusanService;
exports.BkJurusanService = BkJurusanService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(bk_jurusan_entity_1.BkJurusan)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], BkJurusanService);
//# sourceMappingURL=bk-jurusan.service.js.map