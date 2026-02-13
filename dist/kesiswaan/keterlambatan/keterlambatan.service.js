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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeterlambatanService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const keterlambatan_entity_1 = require("./entities/keterlambatan.entity");
const axios_1 = __importDefault(require("axios"));
let KeterlambatanService = class KeterlambatanService {
    keterlambatanRepository;
    walasApiBase = process.env.WALAS_API_BASE_URL || 'http://localhost:8000/api/v1';
    constructor(keterlambatanRepository) {
        this.keterlambatanRepository = keterlambatanRepository;
    }
    async syncFromWalas(startDate, endDate) {
        try {
            console.log(`[Keterlambatan] Syncing from Walas: ${startDate} to ${endDate}`);
            const walasUrl = `${this.walasApiBase}/walas/kehadiran`;
            try {
                const response = await axios_1.default.get(walasUrl, {
                    params: {
                        start_date: startDate,
                        end_date: endDate,
                        limit: 500,
                    },
                    timeout: 10000,
                });
                if (!response.data?.success || !response.data?.data) {
                    throw new common_1.HttpException('Failed to fetch keterlambatan from Walas', common_1.HttpStatus.BAD_GATEWAY);
                }
                return {
                    success: true,
                    message: 'Keterlambatan sync endpoint ready (awaiting Walas API)',
                    totalRecords: 0,
                    results: [],
                };
            }
            catch (apiError) {
                return {
                    success: false,
                    message: 'Walas API not available, please add keterlambatan data manually',
                    error: apiError.message,
                };
            }
        }
        catch (error) {
            console.error('[Keterlambatan] Sync error:', error);
            throw new common_1.HttpException(`Failed to sync keterlambatan: ${error.message}`, common_1.HttpStatus.BAD_GATEWAY);
        }
    }
    async findAll(filterDto) {
        const { startDate, endDate, studentId, className, status, page = 1, limit = 50 } = filterDto;
        const query = this.keterlambatanRepository.createQueryBuilder('keterlambatan');
        if (startDate && endDate) {
            query.andWhere('keterlambatan.date BETWEEN :startDate AND :endDate', {
                startDate,
                endDate,
            });
        }
        if (studentId) {
            query.andWhere('keterlambatan.studentId = :studentId', { studentId });
        }
        if (className) {
            query.andWhere('keterlambatan.className = :className', { className });
        }
        if (status) {
            query.andWhere('keterlambatan.status = :status', { status });
        }
        const total = await query.getCount();
        const data = await query
            .orderBy('keterlambatan.date', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getMany();
        return {
            data,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        const record = await this.keterlambatanRepository.findOne({ where: { id } });
        if (!record) {
            throw new common_1.HttpException('Keterlambatan not found', common_1.HttpStatus.NOT_FOUND);
        }
        return record;
    }
    async findByStudent(studentId, filterDto) {
        const { startDate, endDate, status, page = 1, limit = 50 } = filterDto || {};
        const query = this.keterlambatanRepository.createQueryBuilder('keterlambatan');
        query.andWhere('keterlambatan.studentId = :studentId', { studentId });
        if (startDate && endDate) {
            query.andWhere('keterlambatan.date BETWEEN :startDate AND :endDate', {
                startDate,
                endDate,
            });
        }
        if (status) {
            query.andWhere('keterlambatan.status = :status', { status });
        }
        const total = await query.getCount();
        const data = await query
            .orderBy('keterlambatan.date', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getMany();
        return {
            data,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    async findByClass(className, filterDto) {
        const { startDate, endDate, status, page = 1, limit = 50 } = filterDto || {};
        const query = this.keterlambatanRepository.createQueryBuilder('keterlambatan');
        query.andWhere('keterlambatan.className = :className', { className });
        if (startDate && endDate) {
            query.andWhere('keterlambatan.date BETWEEN :startDate AND :endDate', {
                startDate,
                endDate,
            });
        }
        if (status) {
            query.andWhere('keterlambatan.status = :status', { status });
        }
        const total = await query.getCount();
        const data = await query
            .orderBy('keterlambatan.date', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getMany();
        return {
            data,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    async create(createKeterlambatanDto) {
        const record = this.keterlambatanRepository.create(createKeterlambatanDto);
        return await this.keterlambatanRepository.save(record);
    }
    async update(id, updateKeterlambatanDto) {
        await this.keterlambatanRepository.update(id, updateKeterlambatanDto);
        return this.findOne(id);
    }
    async delete(id) {
        await this.findOne(id);
        await this.keterlambatanRepository.delete(id);
    }
    async getStatistics(filterDto) {
        const { startDate, endDate, studentId, className } = filterDto;
        const query = this.keterlambatanRepository.createQueryBuilder('keterlambatan');
        if (startDate && endDate) {
            query.andWhere('keterlambatan.date BETWEEN :startDate AND :endDate', {
                startDate,
                endDate,
            });
        }
        if (studentId) {
            query.andWhere('keterlambatan.studentId = :studentId', { studentId });
        }
        if (className) {
            query.andWhere('keterlambatan.className = :className', { className });
        }
        const totalTardiness = await query.getCount();
        const sumMinutes = await query
            .select('SUM(keterlambatan.minutesLate)', 'totalMinutes')
            .getRawOne();
        const resolved = await query
            .andWhere('keterlambatan.status = :status', { status: 'resolved' })
            .getCount();
        const averageMinutes = totalTardiness > 0 ? Math.round((sumMinutes?.totalMinutes || 0) / totalTardiness) : 0;
        return {
            totalTardiness,
            totalMinutesLate: sumMinutes?.totalMinutes || 0,
            averageMinutes,
            resolvedCount: resolved,
            unresolvedCount: totalTardiness - resolved,
        };
    }
};
exports.KeterlambatanService = KeterlambatanService;
exports.KeterlambatanService = KeterlambatanService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(keterlambatan_entity_1.Keterlambatan)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], KeterlambatanService);
//# sourceMappingURL=keterlambatan.service.js.map