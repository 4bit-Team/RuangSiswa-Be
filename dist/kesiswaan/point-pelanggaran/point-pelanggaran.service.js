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
var PointPelanggaranService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PointPelanggaranService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const point_pelanggaran_entity_1 = require("./entities/point-pelanggaran.entity");
let PointPelanggaranService = PointPelanggaranService_1 = class PointPelanggaranService {
    pointPelanggaranRepository;
    logger = new common_1.Logger(PointPelanggaranService_1.name);
    constructor(pointPelanggaranRepository) {
        this.pointPelanggaranRepository = pointPelanggaranRepository;
    }
    async create(dto) {
        try {
            const existingKode = await this.pointPelanggaranRepository.findOne({
                where: { kode: dto.kode },
            });
            if (existingKode) {
                throw new common_1.ConflictException(`Kode pelanggaran ${dto.kode} sudah digunakan`);
            }
            if (dto.isActive) {
                await this.deactivateOtherActiveYear(dto.tahun_point);
            }
            const pointPelanggaran = this.pointPelanggaranRepository.create({
                tahun_point: dto.tahun_point,
                category_point: dto.category_point,
                nama_pelanggaran: dto.nama_pelanggaran,
                kode: dto.kode,
                bobot: dto.bobot,
                isActive: dto.isActive || false,
                isSanksi: dto.isSanksi || false,
                isDo: dto.isDo || false,
                deskripsi: dto.deskripsi,
            });
            return await this.pointPelanggaranRepository.save(pointPelanggaran);
        }
        catch (error) {
            this.logger.error(`Error creating point pelanggaran: ${error.message}`);
            throw error;
        }
    }
    async findAll(tahunPoint, isActive) {
        const query = this.pointPelanggaranRepository.createQueryBuilder('pp');
        if (tahunPoint) {
            query.where('pp.tahun_point = :tahunPoint', { tahunPoint });
        }
        if (isActive !== undefined) {
            query.andWhere('pp.isActive = :isActive', { isActive });
        }
        return query.orderBy('pp.tahun_point', 'DESC').addOrderBy('pp.bobot', 'DESC').getMany();
    }
    async findByYear(tahun) {
        return this.pointPelanggaranRepository.find({
            where: { tahun_point: tahun },
            order: { bobot: 'DESC' },
        });
    }
    async findActive() {
        return this.pointPelanggaranRepository.find({
            where: { isActive: true },
            order: { bobot: 'DESC' },
        });
    }
    async findByCategory(category, tahun) {
        const query = this.pointPelanggaranRepository
            .createQueryBuilder('pp')
            .where('pp.category_point = :category', { category });
        if (tahun) {
            query.andWhere('pp.tahun_point = :tahun', { tahun });
        }
        return query.orderBy('pp.bobot', 'DESC').getMany();
    }
    async getCategories() {
        const result = await this.pointPelanggaranRepository
            .createQueryBuilder('pp')
            .select('DISTINCT pp.category_point', 'category')
            .orderBy('pp.category_point', 'ASC')
            .getRawMany();
        return result.map((r) => r.category).filter((c) => c);
    }
    async findById(id) {
        const pointPelanggaran = await this.pointPelanggaranRepository.findOne({
            where: { id },
        });
        if (!pointPelanggaran) {
            throw new common_1.NotFoundException(`Point pelanggaran dengan ID ${id} tidak ditemukan`);
        }
        return pointPelanggaran;
    }
    async findByKode(kode) {
        const pointPelanggaran = await this.pointPelanggaranRepository.findOne({
            where: { kode },
        });
        if (!pointPelanggaran) {
            throw new common_1.NotFoundException(`Point pelanggaran dengan kode ${kode} tidak ditemukan`);
        }
        return pointPelanggaran;
    }
    async update(id, dto) {
        try {
            const pointPelanggaran = await this.findById(id);
            if (dto.kode && dto.kode !== pointPelanggaran.kode) {
                const existingKode = await this.pointPelanggaranRepository.findOne({
                    where: { kode: dto.kode },
                });
                if (existingKode) {
                    throw new common_1.ConflictException(`Kode pelanggaran ${dto.kode} sudah digunakan`);
                }
            }
            if (dto.isActive === true && !pointPelanggaran.isActive) {
                await this.deactivateOtherActiveYear(pointPelanggaran.tahun_point);
            }
            Object.assign(pointPelanggaran, dto);
            return await this.pointPelanggaranRepository.save(pointPelanggaran);
        }
        catch (error) {
            this.logger.error(`Error updating point pelanggaran: ${error.message}`);
            throw error;
        }
    }
    async delete(id) {
        const pointPelanggaran = await this.findById(id);
        await this.pointPelanggaranRepository.delete(id);
    }
    async findSanksi(tahun) {
        const query = this.pointPelanggaranRepository.createQueryBuilder('pp').where('pp.isSanksi = :isSanksi', {
            isSanksi: true,
        });
        if (tahun) {
            query.andWhere('pp.tahun_point = :tahun', { tahun });
        }
        return query.orderBy('pp.bobot', 'DESC').getMany();
    }
    async findDoMutasi(tahun) {
        const query = this.pointPelanggaranRepository.createQueryBuilder('pp').where('pp.isDo = :isDo', { isDo: true });
        if (tahun) {
            query.andWhere('pp.tahun_point = :tahun', { tahun });
        }
        return query.orderBy('pp.bobot', 'DESC').getMany();
    }
    async deactivateOtherActiveYear(tahun) {
        const activeYear = await this.pointPelanggaranRepository.findOne({
            where: { tahun_point: tahun, isActive: true },
        });
        if (activeYear) {
            activeYear.isActive = false;
            await this.pointPelanggaranRepository.save(activeYear);
        }
    }
    async setActive(id) {
        const pointPelanggaran = await this.findById(id);
        await this.deactivateOtherActiveYear(pointPelanggaran.tahun_point);
        pointPelanggaran.isActive = true;
        return await this.pointPelanggaranRepository.save(pointPelanggaran);
    }
    async setInactive(id) {
        const pointPelanggaran = await this.findById(id);
        pointPelanggaran.isActive = false;
        return await this.pointPelanggaranRepository.save(pointPelanggaran);
    }
    async calculateTotalBobot(kodes) {
        if (!kodes || kodes.length === 0) {
            return 0;
        }
        const result = await this.pointPelanggaranRepository
            .createQueryBuilder('pp')
            .select('SUM(pp.bobot)', 'total')
            .where('pp.kode IN (:...kodes)', { kodes })
            .getRawOne();
        return result?.total || 0;
    }
    async getSummaryByYear() {
        const result = await this.pointPelanggaranRepository
            .createQueryBuilder('pp')
            .select('pp.tahun_point', 'tahun')
            .addSelect('COUNT(*)', 'totalPelanggaran')
            .addSelect('MAX(pp.isActive)', 'activeYear')
            .groupBy('pp.tahun_point')
            .orderBy('pp.tahun_point', 'DESC')
            .getRawMany();
        return result.map((row) => ({
            tahun: parseInt(row.tahun),
            totalPelanggaran: parseInt(row.totalPelanggaran),
            activeYear: row.activeYear === true,
        }));
    }
    async getSummaryByCategory() {
        const result = await this.pointPelanggaranRepository
            .createQueryBuilder('pp')
            .select('pp.category_point', 'category')
            .addSelect('COUNT(*)', 'totalPelanggaran')
            .addSelect('MAX(pp.bobot)', 'maxBobot')
            .groupBy('pp.category_point')
            .orderBy('pp.category_point', 'ASC')
            .getRawMany();
        return result.map((row) => ({
            category: row.category,
            totalPelanggaran: parseInt(row.totalPelanggaran),
            maxBobot: parseInt(row.maxBobot),
        }));
    }
};
exports.PointPelanggaranService = PointPelanggaranService;
exports.PointPelanggaranService = PointPelanggaranService = PointPelanggaranService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(point_pelanggaran_entity_1.PointPelanggaran)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PointPelanggaranService);
//# sourceMappingURL=point-pelanggaran.service.js.map