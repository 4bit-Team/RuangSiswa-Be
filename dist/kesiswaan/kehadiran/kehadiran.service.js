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
exports.KehadiranService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const kehadiran_entity_1 = require("./entities/kehadiran.entity");
const axios_1 = __importDefault(require("axios"));
let KehadiranService = class KehadiranService {
    kehadiranRepository;
    walasApiBase = process.env.WALAS_API__URL || 'http://localhost:8000/api/v1';
    constructor(kehadiranRepository) {
        this.kehadiranRepository = kehadiranRepository;
    }
    async syncFromWalas(startDate, endDate) {
        try {
            console.log(`[Kehadiran] Syncing from Walas: ${startDate} to ${endDate}`);
            const walasUrl = `${this.walasApiBase}/walas/kehadiran`;
            const response = await axios_1.default.get(walasUrl, {
                params: {
                    start_date: startDate,
                    end_date: endDate,
                    limit: 500,
                },
                timeout: 10000,
            });
            if (!response.data?.success || !response.data?.data) {
                throw new common_1.HttpException('Failed to fetch kehadiran from Walas', common_1.HttpStatus.BAD_GATEWAY);
            }
            const kehadiranRecords = response.data.data;
            const syncResults = [];
            for (const record of kehadiranRecords) {
                try {
                    const existingRecord = await this.kehadiranRepository.findOne({
                        where: {
                            studentId: record.siswas_id || record.studentId,
                            date: record.tanggal || record.date,
                        },
                    });
                    const kehadiranData = {
                        studentId: record.siswas_id || record.studentId,
                        studentName: record.student_name || record.studentName,
                        className: record.kelas || record.className,
                        date: record.tanggal || record.date,
                        status: this.mapStatusFromWalas(record.status),
                        time: record.time,
                        notes: record.keterangan,
                        walasId: record.walas_id,
                        walasName: record.walas_name,
                        source: 'sync',
                    };
                    if (existingRecord) {
                        await this.kehadiranRepository.update(existingRecord.id, kehadiranData);
                        syncResults.push({
                            status: 'updated',
                            record: record.siswas_id,
                        });
                    }
                    else {
                        const newRecord = this.kehadiranRepository.create(kehadiranData);
                        await this.kehadiranRepository.save(newRecord);
                        syncResults.push({
                            status: 'created',
                            record: record.siswas_id,
                        });
                    }
                }
                catch (error) {
                    console.error(`[Kehadiran] Error processing record:`, error);
                    syncResults.push({
                        status: 'error',
                        record: record.siswas_id,
                        error: error.message,
                    });
                }
            }
            return {
                success: true,
                message: 'Kehadiran synchronized successfully',
                totalRecords: kehadiranRecords.length,
                results: syncResults,
            };
        }
        catch (error) {
            console.error('[Kehadiran] Sync error:', error);
            throw new common_1.HttpException(`Failed to sync kehadiran: ${error.message}`, common_1.HttpStatus.BAD_GATEWAY);
        }
    }
    mapStatusFromWalas(status) {
        const statusMap = {
            H: 'Hadir',
            S: 'Sakit',
            I: 'Izin',
            A: 'Alpa',
            hadir: 'Hadir',
            sakit: 'Sakit',
            izin: 'Izin',
            alfa: 'Alpa',
        };
        return statusMap[status?.toLowerCase()] || 'Hadir';
    }
    async findAll(filterDto) {
        const { startDate, endDate, studentId, className, status, page = 1, limit = 50 } = filterDto;
        const query = this.kehadiranRepository.createQueryBuilder('kehadiran');
        if (startDate && endDate) {
            query.andWhere('kehadiran.date BETWEEN :startDate AND :endDate', {
                startDate,
                endDate,
            });
        }
        if (studentId) {
            query.andWhere('kehadiran.studentId = :studentId', { studentId });
        }
        if (className) {
            query.andWhere('kehadiran.className = :className', { className });
        }
        if (status) {
            query.andWhere('kehadiran.status = :status', { status });
        }
        const total = await query.getCount();
        const data = await query
            .orderBy('kehadiran.date', 'DESC')
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
        const record = await this.kehadiranRepository.findOne({ where: { id } });
        if (!record) {
            throw new common_1.HttpException('Kehadiran not found', common_1.HttpStatus.NOT_FOUND);
        }
        return record;
    }
    async findByStudent(studentId, filterDto) {
        const { startDate, endDate, status, page = 1, limit = 50 } = filterDto || {};
        const query = this.kehadiranRepository.createQueryBuilder('kehadiran');
        query.andWhere('kehadiran.studentId = :studentId', { studentId });
        if (startDate && endDate) {
            query.andWhere('kehadiran.date BETWEEN :startDate AND :endDate', {
                startDate,
                endDate,
            });
        }
        if (status) {
            query.andWhere('kehadiran.status = :status', { status });
        }
        const total = await query.getCount();
        const data = await query
            .orderBy('kehadiran.date', 'DESC')
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
        const query = this.kehadiranRepository.createQueryBuilder('kehadiran');
        query.andWhere('kehadiran.className = :className', { className });
        if (startDate && endDate) {
            query.andWhere('kehadiran.date BETWEEN :startDate AND :endDate', {
                startDate,
                endDate,
            });
        }
        if (status) {
            query.andWhere('kehadiran.status = :status', { status });
        }
        const total = await query.getCount();
        const data = await query
            .orderBy('kehadiran.date', 'DESC')
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
    async create(createKehadiranDto) {
        const record = this.kehadiranRepository.create(createKehadiranDto);
        return await this.kehadiranRepository.save(record);
    }
    async update(id, updateKehadiranDto) {
        await this.kehadiranRepository.update(id, updateKehadiranDto);
        return this.findOne(id);
    }
    async delete(id) {
        await this.findOne(id);
        await this.kehadiranRepository.delete(id);
    }
    async getStatistics(filterDto) {
        const { startDate, endDate, studentId, className } = filterDto;
        const query = this.kehadiranRepository.createQueryBuilder('kehadiran');
        if (startDate && endDate) {
            query.andWhere('kehadiran.date BETWEEN :startDate AND :endDate', {
                startDate,
                endDate,
            });
        }
        if (studentId) {
            query.andWhere('kehadiran.studentId = :studentId', { studentId });
        }
        if (className) {
            query.andWhere('kehadiran.className = :className', { className });
        }
        const totalRecords = await query.getCount();
        const hadir = await query.andWhere('kehadiran.status = :status', { status: 'Hadir' }).getCount();
        const sakit = await query.andWhere('kehadiran.status = :status', { status: 'Sakit' }).getCount();
        const izin = await query.andWhere('kehadiran.status = :status', { status: 'Izin' }).getCount();
        const alpa = await query.andWhere('kehadiran.status = :status', { status: 'Alpa' }).getCount();
        return {
            totalRecords,
            totalHadir: hadir,
            totalSakit: sakit,
            totalIzin: izin,
            totalAlpa: alpa,
            attendancePercentage: totalRecords > 0 ? Math.round((hadir / totalRecords) * 100) : 0,
        };
    }
};
exports.KehadiranService = KehadiranService;
exports.KehadiranService = KehadiranService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(kehadiran_entity_1.Kehadiran)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], KehadiranService);
//# sourceMappingURL=kehadiran.service.js.map