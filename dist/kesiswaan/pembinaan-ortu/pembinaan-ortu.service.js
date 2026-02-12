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
var PembinaanOrtuService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PembinaanOrtuService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const pembinaan_ortu_entity_1 = require("./entities/pembinaan-ortu.entity");
const pembinaan_entity_1 = require("../pembinaan/entities/pembinaan.entity");
let PembinaanOrtuService = PembinaanOrtuService_1 = class PembinaanOrtuService {
    pembinaanOrtuRepo;
    pembinaanRepo;
    logger = new common_1.Logger(PembinaanOrtuService_1.name);
    constructor(pembinaanOrtuRepo, pembinaanRepo) {
        this.pembinaanOrtuRepo = pembinaanOrtuRepo;
        this.pembinaanRepo = pembinaanRepo;
    }
    async create(createDto) {
        try {
            const pembinaan = await this.pembinaanRepo.findOne({
                where: { id: createDto.pembinaan_id },
            });
            if (!pembinaan) {
                throw new common_1.NotFoundException(`Pembinaan ${createDto.pembinaan_id} tidak ditemukan`);
            }
            const scheduledDate = new Date(createDto.scheduled_date);
            const pembinaanOrtu = new pembinaan_ortu_entity_1.PembinaanOrtu();
            pembinaanOrtu.pembinaan_id = createDto.pembinaan_id;
            pembinaanOrtu.student_id = createDto.student_id;
            pembinaanOrtu.student_name = createDto.student_name;
            pembinaanOrtu.student_class = createDto.student_class;
            pembinaanOrtu.parent_id = (createDto.parent_id || null);
            pembinaanOrtu.parent_name = createDto.parent_name;
            pembinaanOrtu.parent_phone = (createDto.parent_phone || null);
            pembinaanOrtu.violation_details = createDto.violation_details;
            pembinaanOrtu.letter_content = createDto.letter_content;
            pembinaanOrtu.scheduled_date = scheduledDate;
            pembinaanOrtu.scheduled_time = (createDto.scheduled_time || null);
            pembinaanOrtu.location = (createDto.location || null);
            pembinaanOrtu.communication_method = createDto.communication_method || 'manual';
            pembinaanOrtu.kesiswaan_notes = (createDto.kesiswaan_notes || null);
            pembinaanOrtu.status = 'pending';
            const saved = await this.pembinaanOrtuRepo.save(pembinaanOrtu);
            this.logger.log(`✅ Pembinaan Ortu created for student ${createDto.student_id}`);
            return saved;
        }
        catch (error) {
            this.logger.error(`Error creating pembinaan ortu: ${error.message}`);
            throw error;
        }
    }
    async findAll() {
        return this.pembinaanOrtuRepo.find({
            relations: ['pembinaan', 'parent'],
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const record = await this.pembinaanOrtuRepo.findOne({
            where: { id },
            relations: ['pembinaan', 'parent'],
        });
        if (!record) {
            throw new common_1.NotFoundException(`Pembinaan Ortu ${id} tidak ditemukan`);
        }
        return record;
    }
    async findByParentId(parentId) {
        const records = await this.pembinaanOrtuRepo.find({
            where: { parent_id: parentId },
            relations: ['pembinaan'],
            order: { createdAt: 'DESC' },
        });
        return records.map(r => ({
            id: r.id,
            student_name: r.student_name,
            student_class: r.student_class,
            violation_details: r.violation_details,
            letter_content: r.letter_content,
            scheduled_date: r.scheduled_date,
            scheduled_time: r.scheduled_time,
            location: r.location,
            status: r.status,
            createdAt: r.createdAt,
        }));
    }
    async findByStudentId(studentId) {
        return this.pembinaanOrtuRepo.find({
            where: { student_id: studentId },
            relations: ['pembinaan', 'parent'],
            order: { createdAt: 'DESC' },
        });
    }
    async update(id, updateDto) {
        const record = await this.findOne(id);
        if (updateDto.scheduled_date) {
            updateDto.scheduled_date = new Date(updateDto.scheduled_date);
        }
        Object.assign(record, updateDto);
        const updated = await this.pembinaanOrtuRepo.save(record);
        this.logger.log(`✅ Pembinaan Ortu ${id} updated`);
        return updated;
    }
    async sendLetter(id, sendDto) {
        const record = await this.findOne(id);
        if (record.status !== 'pending') {
            throw new common_1.BadRequestException(`Letter sudah dikirim`);
        }
        record.status = 'sent';
        record.communication_method = sendDto.communication_method;
        record.sent_at = new Date();
        const updated = await this.pembinaanOrtuRepo.save(record);
        this.logger.log(`✅ Letter sent for Pembinaan Ortu ${id} via ${sendDto.communication_method}`);
        return updated;
    }
    async recordParentResponse(id, respondDto) {
        const record = await this.findOne(id);
        record.parent_response = respondDto.parent_response;
        record.parent_response_date = new Date();
        record.status = 'responded';
        const updated = await this.pembinaanOrtuRepo.save(record);
        this.logger.log(`✅ Parent response recorded for Pembinaan Ortu ${id}`);
        return updated;
    }
    async recordMeeting(id, recordDto) {
        const record = await this.findOne(id);
        record.meeting_result = recordDto.meeting_result;
        record.meeting_date = new Date();
        record.parent_response = recordDto.parent_response || record.parent_response;
        record.requires_follow_up = recordDto.requires_follow_up || false;
        record.follow_up_notes = (recordDto.follow_up_notes || null);
        record.status = 'closed';
        record.closedAt = new Date();
        const updated = await this.pembinaanOrtuRepo.save(record);
        this.logger.log(`✅ Meeting recorded for Pembinaan Ortu ${id}`);
        return updated;
    }
    async getPendingLetters() {
        return this.pembinaanOrtuRepo.find({
            where: { status: 'pending' },
            relations: ['pembinaan', 'parent'],
            order: { createdAt: 'ASC' },
        });
    }
    async getStatistics() {
        const total = await this.pembinaanOrtuRepo.count();
        const pending = await this.pembinaanOrtuRepo.count({ where: { status: 'pending' } });
        const sent = await this.pembinaanOrtuRepo.count({ where: { status: 'sent' } });
        const responded = await this.pembinaanOrtuRepo.count({ where: { status: 'responded' } });
        const closed = await this.pembinaanOrtuRepo.count({ where: { status: 'closed' } });
        return {
            total,
            pending,
            sent,
            responded,
            closed,
        };
    }
};
exports.PembinaanOrtuService = PembinaanOrtuService;
exports.PembinaanOrtuService = PembinaanOrtuService = PembinaanOrtuService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(pembinaan_ortu_entity_1.PembinaanOrtu)),
    __param(1, (0, typeorm_1.InjectRepository)(pembinaan_entity_1.Pembinaan)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], PembinaanOrtuService);
//# sourceMappingURL=pembinaan-ortu.service.js.map