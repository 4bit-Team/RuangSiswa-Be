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
var PembinaanService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PembinaanService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const pembinaan_entity_1 = require("./entities/pembinaan.entity");
const point_pelanggaran_entity_1 = require("../point-pelanggaran/entities/point-pelanggaran.entity");
const walas_api_client_1 = require("../../walas/walas-api.client");
const notification_service_1 = require("../../notifications/notification.service");
let PembinaanService = PembinaanService_1 = class PembinaanService {
    pembinaanRepository;
    pointPelanggaranRepository;
    walasApiClient;
    notificationService;
    logger = new common_1.Logger(PembinaanService_1.name);
    constructor(pembinaanRepository, pointPelanggaranRepository, walasApiClient, notificationService) {
        this.pembinaanRepository = pembinaanRepository;
        this.pointPelanggaranRepository = pointPelanggaranRepository;
        this.walasApiClient = walasApiClient;
        this.notificationService = notificationService;
    }
    async fetchAndSyncFromWalas(filters) {
        try {
            const result = { synced: 0, skipped: 0, errors: [] };
            const response = await this.walasApiClient.getPelanggaranList({
                student_id: filters?.student_id,
                class_id: filters?.class_id,
                walas_id: filters?.walas_id,
                start_date: filters?.start_date,
                end_date: filters?.end_date,
                limit: 100,
            });
            if (!response || !response.data) {
                this.logger.warn('No data received from WALASU pelanggaran endpoint');
                return result;
            }
            const pelanggaranList = Array.isArray(response.data) ? response.data : [response.data];
            for (const pelanggaran of pelanggaranList) {
                try {
                    const syncDto = {
                        walas_id: pelanggaran.walas_id,
                        walas_name: pelanggaran.walas_name || 'Unknown',
                        siswas_id: pelanggaran.siswas_id,
                        siswas_name: pelanggaran.siswas_name || 'Unknown',
                        kasus: pelanggaran.kasus,
                        tindak_lanjut: pelanggaran.tindak_lanjut || '',
                        keterangan: pelanggaran.keterangan || '',
                        tanggal_pembinaan: pelanggaran.tanggal_pembinaan || new Date().toISOString(),
                        class_id: pelanggaran.class_id,
                        class_name: pelanggaran.class_name,
                    };
                    const existing = await this.pembinaanRepository.findOne({
                        where: {
                            walas_id: syncDto.walas_id,
                            siswas_id: syncDto.siswas_id,
                            kasus: syncDto.kasus,
                            tanggal_pembinaan: syncDto.tanggal_pembinaan,
                        },
                    });
                    if (existing) {
                        this.logger.debug(`Pembinaan already exists for student ${syncDto.siswas_id}, skipping`);
                        result.skipped++;
                        continue;
                    }
                    await this.syncFromWalas(syncDto);
                    result.synced++;
                }
                catch (itemError) {
                    this.logger.error(`Error syncing pelanggaran: ${itemError.message}`);
                    result.errors.push({
                        pelanggaran_id: pelanggaran.id,
                        siswas_id: pelanggaran.siswas_id,
                        error: itemError.message,
                    });
                }
            }
            this.logger.log(`Fetch-and-sync complete: Synced=${result.synced}, Skipped=${result.skipped}, Errors=${result.errors.length}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Error in fetchAndSyncFromWalas: ${error.message}`);
            throw error;
        }
    }
    async syncFromWalas(dto) {
        try {
            const existing = await this.pembinaanRepository.findOne({
                where: {
                    walas_id: dto.walas_id,
                    siswas_id: dto.siswas_id,
                    kasus: dto.kasus,
                    tanggal_pembinaan: dto.tanggal_pembinaan,
                },
            });
            if (existing) {
                this.logger.warn(`Pembinaan already exists for student ${dto.siswas_id} on ${dto.tanggal_pembinaan}`);
                return existing;
            }
            let matchResult = { id: null, type: 'none', confidence: 0, explanation: '' };
            if (dto.point_pelanggaran_id) {
                const point = await this.pointPelanggaranRepository.findOne({
                    where: { id: dto.point_pelanggaran_id },
                });
                if (point) {
                    matchResult = {
                        id: point.id,
                        type: 'manual',
                        confidence: 100,
                        explanation: `Manual assignment: ${point.nama_pelanggaran}`,
                    };
                }
            }
            else {
                matchResult = await this.matchPointPelanggaran(dto.kasus);
            }
            const pembinaan = this.pembinaanRepository.create({
                walas_id: dto.walas_id,
                walas_name: dto.walas_name,
                siswas_id: dto.siswas_id,
                siswas_name: dto.siswas_name,
                point_pelanggaran_id: matchResult.id ?? undefined,
                kasus: dto.kasus,
                tindak_lanjut: dto.tindak_lanjut,
                keterangan: dto.keterangan,
                tanggal_pembinaan: dto.tanggal_pembinaan,
                status: 'pending',
                match_type: matchResult.type,
                match_confidence: matchResult.confidence,
                match_explanation: matchResult.explanation,
                class_id: dto.class_id,
                class_name: dto.class_name,
            });
            const saved = await this.pembinaanRepository.save(pembinaan);
            this.logger.log(`Pembinaan synced for student ${dto.siswas_id}: Match=${matchResult.type} (${matchResult.confidence}%)`);
            return saved;
        }
        catch (error) {
            this.logger.error(`Error syncing pembinaan: ${error.message}`);
            throw error;
        }
    }
    async matchPointPelanggaran(kasus) {
        try {
            const kasusLower = kasus.toLowerCase();
            const words = kasusLower.split(/\s+/).filter((w) => w.length > 2);
            const points = await this.pointPelanggaranRepository.find({
                order: { bobot: 'DESC' },
            });
            if (points.length === 0) {
                return {
                    id: null,
                    type: 'none',
                    confidence: 0,
                    explanation: 'No point pelanggaran available for matching',
                };
            }
            for (const point of points) {
                const namaLower = point.nama_pelanggaran.toLowerCase();
                if (kasusLower.includes(namaLower) || namaLower.includes(kasusLower)) {
                    return {
                        id: point.id,
                        type: 'exact',
                        confidence: 100,
                        explanation: `Exact match: ${point.nama_pelanggaran}`,
                    };
                }
            }
            for (const point of points) {
                const namaWords = point.nama_pelanggaran.toLowerCase().split(/\s+/);
                const matchCount = words.filter((w) => namaWords.some((nw) => nw.includes(w))).length;
                const matchScore = Math.round((matchCount / Math.max(words.length, 1)) * 100);
                if (matchScore >= 50) {
                    return {
                        id: point.id,
                        type: 'keyword',
                        confidence: matchScore,
                        explanation: `Keyword match (${matchScore}%): ${point.nama_pelanggaran}`,
                    };
                }
            }
            for (const point of points) {
                const kasusWords = kasus.split(/\s+/).map((w) => w.toLowerCase());
                const categoryMatches = this.getCategoryMatches(kasusWords);
                if (categoryMatches.includes(point.category_point)) {
                    return {
                        id: point.id,
                        type: 'category',
                        confidence: 60,
                        explanation: `Category match: ${point.category_point} - ${point.nama_pelanggaran}`,
                    };
                }
            }
            return {
                id: null,
                type: 'none',
                confidence: 0,
                explanation: 'No matching point pelanggaran found',
            };
        }
        catch (error) {
            this.logger.error(`Error matching point pelanggaran: ${error.message}`);
            return {
                id: null,
                type: 'error',
                confidence: 0,
                explanation: `Matching error: ${error.message}`,
            };
        }
    }
    getCategoryMatches(words) {
        const categoryMap = {
            kehadiran: ['terlambat', 'bolos', 'absen', 'tidak', 'hadir', 'tidak masuk'],
            pakaian: ['pakaian', 'seragam', 'rapi', 'tidak', 'panjang', 'pendek', 'sopan'],
            kepribadian: ['berkelakuan', 'sopan', 'santun', 'hormat', 'budaya', 'perilaku', 'moral'],
            ketertiban: ['ramai', 'mengganggu', 'tertib', 'disiplin', 'aturan', 'tata', 'suara'],
            kesehatan: ['merokok', 'narkoba', 'alkohol', 'kesehatan', 'sehat', 'kebersihan'],
        };
        const matches = [];
        for (const [category, keywords] of Object.entries(categoryMap)) {
            const matched = words.some((w) => keywords.includes(w));
            if (matched) {
                matches.push(category);
            }
        }
        return matches;
    }
    async findAll(filters) {
        this.logger.log(`📥 findAll called with filters: ${JSON.stringify(filters)}`);
        try {
            this.logger.debug('🔍 Creating query builder...');
            const query = this.pembinaanRepository.createQueryBuilder('p').leftJoinAndSelect('p.pointPelanggaran', 'pp');
            if (filters?.status) {
                this.logger.debug(`📋 Adding status filter: ${filters.status}`);
                query.where('p.status = :status', { status: filters.status });
            }
            if (filters?.siswas_id) {
                this.logger.debug(`👤 Adding siswas_id filter: ${filters.siswas_id}`);
                query.andWhere('p.siswas_id = :siswas_id', { siswas_id: filters.siswas_id });
            }
            if (filters?.walas_id) {
                this.logger.debug(`👨‍🏫 Adding walas_id filter: ${filters.walas_id}`);
                query.andWhere('p.walas_id = :walas_id', { walas_id: filters.walas_id });
            }
            this.logger.debug('🔨 Executing query...');
            const result = await query.orderBy('p.tanggal_pembinaan', 'DESC').getMany();
            this.logger.log(`✅ Query successful, returned ${result.length} records`);
            if (result.length > 0) {
                this.logger.debug(`📊 Sample data: ${JSON.stringify(result[0])}`);
            }
            return result;
        }
        catch (error) {
            this.logger.error(`❌ Error in findAll: ${error.message}`, error.stack);
            this.logger.error(`💾 Database connection status: ${this.pembinaanRepository.manager.connection.isInitialized}`);
            throw error;
        }
    }
    async findById(id) {
        const pembinaan = await this.pembinaanRepository.findOne({
            where: { id },
            relations: ['pointPelanggaran'],
        });
        if (!pembinaan) {
            throw new common_1.NotFoundException(`Pembinaan dengan ID ${id} tidak ditemukan`);
        }
        return pembinaan;
    }
    async findByStudent(siswas_id) {
        return this.pembinaanRepository.find({
            where: { siswas_id },
            relations: ['pointPelanggaran'],
            order: { tanggal_pembinaan: 'DESC' },
        });
    }
    async findByWalas(walas_id) {
        return this.pembinaanRepository.find({
            where: { walas_id },
            relations: ['pointPelanggaran'],
            order: { tanggal_pembinaan: 'DESC' },
        });
    }
    async update(id, dto) {
        try {
            const pembinaan = await this.findById(id);
            if (dto.point_pelanggaran_id) {
                const point = await this.pointPelanggaranRepository.findOne({
                    where: { id: dto.point_pelanggaran_id },
                });
                if (!point) {
                    throw new common_1.BadRequestException(`Point pelanggaran dengan ID ${dto.point_pelanggaran_id} tidak ditemukan`);
                }
            }
            Object.assign(pembinaan, dto);
            return await this.pembinaanRepository.save(pembinaan);
        }
        catch (error) {
            this.logger.error(`Error updating pembinaan: ${error.message}`);
            throw error;
        }
    }
    async delete(id) {
        const pembinaan = await this.findById(id);
        await this.pembinaanRepository.delete(id);
    }
    async getStatistics(filters) {
        let query = this.pembinaanRepository.createQueryBuilder('p');
        if (filters?.startDate) {
            query.andWhere('p.tanggal_pembinaan >= :startDate', { startDate: filters.startDate });
        }
        if (filters?.endDate) {
            query.andWhere('p.tanggal_pembinaan <= :endDate', { endDate: filters.endDate });
        }
        if (filters?.siswas_id) {
            query.andWhere('p.siswas_id = :siswas_id', { siswas_id: filters.siswas_id });
        }
        if (filters?.walas_id) {
            query.andWhere('p.walas_id = :walas_id', { walas_id: filters.walas_id });
        }
        const total = await query.getCount();
        const byStatus = await this.pembinaanRepository
            .createQueryBuilder('p')
            .select('p.status', 'status')
            .addSelect('COUNT(*)', 'count')
            .groupBy('p.status')
            .getRawMany();
        const byMatchType = await this.pembinaanRepository
            .createQueryBuilder('p')
            .select('p.match_type', 'match_type')
            .addSelect('COUNT(*)', 'count')
            .addSelect('AVG(p.match_confidence)', 'avg_confidence')
            .groupBy('p.match_type')
            .getRawMany();
        const averageConfidence = await this.pembinaanRepository
            .createQueryBuilder('p')
            .select('AVG(p.match_confidence)', 'avg')
            .getRawOne();
        return {
            total,
            by_status: Object.fromEntries(byStatus.map((s) => [s.status, parseInt(s.count)])),
            by_match_type: byMatchType.map((m) => ({
                match_type: m.match_type,
                count: parseInt(m.count),
                avg_confidence: Math.round(parseFloat(m.avg_confidence) || 0),
            })),
            average_confidence: Math.round(parseFloat(averageConfidence.avg) || 0),
        };
    }
    async getUnmatched() {
        return this.pembinaanRepository.find({
            where: { match_type: 'none' },
            relations: ['pointPelanggaran'],
            order: { createdAt: 'DESC' },
        });
    }
    async getWalasStatistics(filters) {
        try {
            const stats = await this.walasApiClient.getPelanggaranStats({
                class_id: filters?.class_id,
                walas_id: filters?.walas_id,
                start_date: filters?.start_date,
                end_date: filters?.end_date,
            });
            return stats || { message: 'No statistics available' };
        }
        catch (error) {
            this.logger.error(`Error fetching WALAS statistics: ${error.message}`);
            throw error;
        }
    }
    async updateStatus(ids, status) {
        await this.pembinaanRepository.update({ id: ids[0] }, { status });
        for (const id of ids) {
            await this.pembinaanRepository.update({ id }, { status });
        }
    }
    async search(query) {
        return this.pembinaanRepository
            .createQueryBuilder('p')
            .where('p.kasus ILIKE :query', { query: `%${query}%` })
            .orWhere('p.keterangan ILIKE :query', { query: `%${query}%` })
            .orWhere('p.siswas_name ILIKE :query', { query: `%${query}%` })
            .orderBy('p.tanggal_pembinaan', 'DESC')
            .getMany();
    }
};
exports.PembinaanService = PembinaanService;
exports.PembinaanService = PembinaanService = PembinaanService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(pembinaan_entity_1.Pembinaan)),
    __param(1, (0, typeorm_1.InjectRepository)(point_pelanggaran_entity_1.PointPelanggaran)),
    __param(3, (0, common_1.Optional)()),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => notification_service_1.NotificationService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        walas_api_client_1.WalasApiClient,
        notification_service_1.NotificationService])
], PembinaanService);
//# sourceMappingURL=pembinaan.service.js.map