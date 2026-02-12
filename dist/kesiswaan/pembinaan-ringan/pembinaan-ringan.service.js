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
var PembinaanRinganService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PembinaanRinganService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const pembinaan_ringan_entity_1 = require("./entities/pembinaan-ringan.entity");
const reservasi_entity_1 = require("../../reservasi/entities/reservasi.entity");
let PembinaanRinganService = PembinaanRinganService_1 = class PembinaanRinganService {
    pembinaanRinganRepo;
    reservasiRepo;
    logger = new common_1.Logger(PembinaanRinganService_1.name);
    constructor(pembinaanRinganRepo, reservasiRepo) {
        this.pembinaanRinganRepo = pembinaanRinganRepo;
        this.reservasiRepo = reservasiRepo;
    }
    async create(createDto) {
        try {
            if (createDto.reservasi_id) {
                const reservasi = await this.reservasiRepo.findOne({
                    where: { id: createDto.reservasi_id },
                });
                if (!reservasi) {
                    throw new common_1.NotFoundException(`Reservasi ${createDto.reservasi_id} tidak ditemukan`);
                }
            }
            const scheduledDate = new Date(createDto.scheduled_date);
            const pembinaanRingan = this.pembinaanRinganRepo.create({
                reservasi_id: createDto.reservasi_id || null,
                pembinaan_id: createDto.pembinaan_id,
                student_id: createDto.student_id,
                student_name: createDto.student_name,
                counselor_id: createDto.counselor_id,
                hasil_pembinaan: createDto.hasil_pembinaan,
                catatan_bk: createDto.catatan_bk,
                scheduled_date: scheduledDate,
                scheduled_time: createDto.scheduled_time,
                sp_level: createDto.sp_level || null,
                status: 'pending',
            });
            const saved = await this.pembinaanRinganRepo.save(pembinaanRingan);
            this.logger.log(`✅ Pembinaan Ringan created for student ${createDto.student_id}${createDto.reservasi_id ? ` (Reservasi: ${createDto.reservasi_id})` : ''}`);
            return saved;
        }
        catch (error) {
            this.logger.error(`Error creating pembinaan ringan: ${error.message}`);
            throw error;
        }
    }
    async findAll() {
        return this.pembinaanRinganRepo.find({
            relations: ['reservasi', 'pembinaan', 'counselor'],
            order: { createdAt: 'DESC' },
        });
    }
    async findPendingForCounselor(counselorId) {
        return this.pembinaanRinganRepo.find({
            where: {
                counselor_id: counselorId,
                status: 'pending',
            },
            relations: ['reservasi', 'pembinaan'],
            order: { scheduled_date: 'ASC' },
        });
    }
    async findOne(id) {
        const record = await this.pembinaanRinganRepo.findOne({
            where: { id },
            relations: ['reservasi', 'pembinaan', 'counselor'],
        });
        if (!record) {
            throw new common_1.NotFoundException(`Pembinaan Ringan ${id} tidak ditemukan`);
        }
        return record;
    }
    async approve(id, approveDto) {
        const record = await this.findOne(id);
        if (record.status !== 'pending') {
            throw new common_1.BadRequestException(`Pembinaan Ringan sudah dalam status ${record.status}`);
        }
        record.status = approveDto.status;
        record.bk_feedback = approveDto.bk_feedback || null;
        record.bk_notes = approveDto.bk_notes || null;
        if (approveDto.sp_level !== undefined) {
            record.sp_level = approveDto.sp_level || null;
        }
        if (approveDto.status === 'approved') {
            record.approvedAt = new Date();
        }
        const updated = await this.pembinaanRinganRepo.save(record);
        this.logger.log(`✅ Pembinaan Ringan ${id} ${approveDto.status}`);
        return updated;
    }
    async complete(id, completeDto) {
        const record = await this.findOne(id);
        if (record.status === 'completed' || record.status === 'rejected' || record.status === 'cancelled') {
            throw new common_1.BadRequestException(`Tidak dapat complete pembinaan yang sudah ${record.status}`);
        }
        record.status = 'completed';
        record.bk_feedback = completeDto.bk_feedback;
        record.bk_notes = completeDto.bk_notes || null;
        record.has_follow_up = completeDto.has_follow_up || false;
        record.follow_up_notes = completeDto.follow_up_notes || null;
        record.completedAt = new Date();
        const updated = await this.pembinaanRinganRepo.save(record);
        this.logger.log(`✅ Pembinaan Ringan ${id} completed`);
        return updated;
    }
    async update(id, updateDto) {
        const record = await this.findOne(id);
        Object.assign(record, updateDto);
        const updated = await this.pembinaanRinganRepo.save(record);
        this.logger.log(`✅ Pembinaan Ringan ${id} updated`);
        return updated;
    }
    async findByStudentId(studentId) {
        return this.pembinaanRinganRepo.find({
            where: { student_id: studentId },
            relations: ['reservasi', 'pembinaan', 'counselor'],
            order: { createdAt: 'DESC' },
        });
    }
    async getStatistics() {
        const total = await this.pembinaanRinganRepo.count();
        const pending = await this.pembinaanRinganRepo.count({ where: { status: 'pending' } });
        const approved = await this.pembinaanRinganRepo.count({ where: { status: 'approved' } });
        const completed = await this.pembinaanRinganRepo.count({ where: { status: 'completed' } });
        const cancelled = await this.pembinaanRinganRepo.count({ where: { status: 'cancelled' } });
        return {
            total,
            pending,
            approved,
            completed,
            cancelled,
        };
    }
};
exports.PembinaanRinganService = PembinaanRinganService;
exports.PembinaanRinganService = PembinaanRinganService = PembinaanRinganService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(pembinaan_ringan_entity_1.PembinaanRingan)),
    __param(1, (0, typeorm_1.InjectRepository)(reservasi_entity_1.Reservasi)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], PembinaanRinganService);
//# sourceMappingURL=pembinaan-ringan.service.js.map