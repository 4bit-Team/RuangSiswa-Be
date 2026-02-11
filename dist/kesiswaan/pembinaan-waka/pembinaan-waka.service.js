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
var PembinaanWakaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PembinaanWakaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const pembinaan_waka_entity_1 = require("./entities/pembinaan-waka.entity");
const reservasi_entity_1 = require("../../reservasi/entities/reservasi.entity");
const notification_service_1 = require("../../notifications/notification.service");
let PembinaanWakaService = PembinaanWakaService_1 = class PembinaanWakaService {
    pembinaanWakaRepository;
    reservasiRepository;
    notificationService;
    logger = new common_1.Logger(PembinaanWakaService_1.name);
    constructor(pembinaanWakaRepository, reservasiRepository, notificationService) {
        this.pembinaanWakaRepository = pembinaanWakaRepository;
        this.reservasiRepository = reservasiRepository;
        this.notificationService = notificationService;
    }
    async create(dto) {
        const reservasi = await this.reservasiRepository.findOne({
            where: { id: dto.reservasi_id },
        });
        if (!reservasi) {
            throw new common_1.BadRequestException(`Reservasi with ID ${dto.reservasi_id} not found`);
        }
        if (reservasi.pembinaanType !== 'berat') {
            throw new common_1.BadRequestException('PembinaanWaka can only be created for "berat" type pembinaan');
        }
        const pembinaanWaka = this.pembinaanWakaRepository.create({
            reservasi_id: dto.reservasi_id,
            pembinaan_id: dto.pembinaan_id,
            waka_id: dto.waka_id,
            status: 'pending',
            created_by: dto.waka_id,
        });
        return await this.pembinaanWakaRepository.save(pembinaanWaka);
    }
    async findAll() {
        return await this.pembinaanWakaRepository.find({
            relations: ['reservasi', 'pembinaan', 'waka'],
        });
    }
    async getPendingForWaka(waka_id) {
        return await this.pembinaanWakaRepository.find({
            where: {
                waka_id,
                status: 'pending',
            },
            relations: ['reservasi', 'pembinaan', 'waka'],
        });
    }
    async findOne(id) {
        const pembinaanWaka = await this.pembinaanWakaRepository.findOne({
            where: { id },
            relations: ['reservasi', 'pembinaan', 'waka'],
        });
        if (!pembinaanWaka) {
            throw new common_1.NotFoundException(`PembinaanWaka with ID ${id} not found`);
        }
        return pembinaanWaka;
    }
    async makeDecision(id, dto, waka_id) {
        const pembinaanWaka = await this.findOne(id);
        if (pembinaanWaka.waka_id !== waka_id) {
            throw new common_1.ForbiddenException('Only the assigned WAKA can make this decision');
        }
        if (!['pending', 'in_review'].includes(pembinaanWaka.status)) {
            throw new common_1.BadRequestException(`Cannot make decision. Current status is ${pembinaanWaka.status}. Decision can only be made from 'pending' or 'in_review' status.`);
        }
        pembinaanWaka.wak_decision = dto.wak_decision;
        pembinaanWaka.decision_reason = dto.decision_reason ?? null;
        pembinaanWaka.notes = dto.notes ?? null;
        pembinaanWaka.status = 'decided';
        pembinaanWaka.decision_date = new Date();
        pembinaanWaka.updated_by = waka_id;
        const updated = await this.pembinaanWakaRepository.save(pembinaanWaka);
        try {
            const reservasi = await this.reservasiRepository.findOne({
                where: { id: pembinaanWaka.reservasi_id },
            });
            if (reservasi) {
                const decisionText = dto.wak_decision === 'SP3' ? 'Surat Peringatan III' : 'Surat Dikecam (Skorsing)';
                if (this.notificationService) {
                    await this.notificationService.create({
                        recipient_id: reservasi.studentId,
                        type: 'decision_made',
                        title: `Keputusan WAKA: ${decisionText}`,
                        message: `WAKA telah membuat keputusan terkait kasus Anda: ${decisionText}. ${dto.decision_reason ? `Alasan: ${dto.decision_reason}` : ''}`,
                        related_id: pembinaanWaka.id,
                        related_type: 'pembinaan_waka',
                        metadata: {
                            student_id: reservasi.studentId,
                            waka_id: waka_id,
                            decision: dto.wak_decision,
                            decision_reason: dto.decision_reason,
                            decision_date: new Date().toISOString(),
                        },
                    });
                    this.logger.log(`Notification sent: decision_made for student ${reservasi.studentId}`);
                }
            }
        }
        catch (error) {
            this.logger.warn(`Failed to create decision_made notification: ${error.message}`);
        }
        this.logger.log(`WAKA ${waka_id} decided ${dto.wak_decision} for PembinaanWaka ${id}. Reason: ${dto.decision_reason}`);
        return updated;
    }
    async studentAcknowledge(id, dto, student_id) {
        const pembinaanWaka = await this.findOne(id);
        const reservasi = await this.reservasiRepository.findOne({
            where: { id: pembinaanWaka.reservasi_id },
        });
        if (!reservasi || reservasi.studentId !== student_id) {
            throw new common_1.ForbiddenException('Only the affected student can acknowledge this decision');
        }
        if (pembinaanWaka.status !== 'decided') {
            throw new common_1.BadRequestException(`Cannot acknowledge. Current status is ${pembinaanWaka.status}. Decision must be 'decided' first.`);
        }
        if (dto.acknowledged) {
            pembinaanWaka.student_acknowledged = true;
            pembinaanWaka.student_response = dto.student_response ?? null;
        }
        return await this.pembinaanWakaRepository.save(pembinaanWaka);
    }
    async markAsExecuted(id, waka_id, execution_notes) {
        const pembinaanWaka = await this.findOne(id);
        if (pembinaanWaka.waka_id !== waka_id) {
            throw new common_1.ForbiddenException('Only the assigned WAKA can execute the decision');
        }
        if (pembinaanWaka.status !== 'decided') {
            throw new common_1.BadRequestException(`Cannot execute. Current status is ${pembinaanWaka.status}. Must be 'decided' first.`);
        }
        if (!pembinaanWaka.student_acknowledged) {
            throw new common_1.BadRequestException('Student must acknowledge the decision before execution');
        }
        pembinaanWaka.status = 'executed';
        if (execution_notes) {
            pembinaanWaka.notes = execution_notes;
        }
        else {
            pembinaanWaka.notes = pembinaanWaka.notes ?? null;
        }
        pembinaanWaka.updated_by = waka_id;
        this.logger.log(`PembinaanWaka ${id} marked as executed. Decision: ${pembinaanWaka.wak_decision}. Updated by WAKA ${waka_id}`);
        return await this.pembinaanWakaRepository.save(pembinaanWaka);
    }
    async submitAppeal(id, dto, student_id) {
        const pembinaanWaka = await this.findOne(id);
        const reservasi = await this.reservasiRepository.findOne({
            where: { id: pembinaanWaka.reservasi_id },
        });
        if (!reservasi || reservasi.studentId !== student_id) {
            throw new common_1.ForbiddenException('Only the affected student can appeal this decision');
        }
        if (!['decided', 'executed'].includes(pembinaanWaka.status)) {
            throw new common_1.BadRequestException(`Cannot appeal. Current status is ${pembinaanWaka.status}. Can only appeal 'decided' or 'executed' decisions.`);
        }
        pembinaanWaka.has_appeal = true;
        pembinaanWaka.appeal_reason = dto.appeal_reason ?? null;
        pembinaanWaka.appeal_date = new Date();
        pembinaanWaka.status = 'appealed';
        this.logger.log(`Student ${student_id} appealed PembinaanWaka ${id}. Reason: ${dto.appeal_reason}`);
        return await this.pembinaanWakaRepository.save(pembinaanWaka);
    }
    async decideOnAppeal(id, appealDecision, waka_id) {
        const pembinaanWaka = await this.findOne(id);
        if (pembinaanWaka.waka_id !== waka_id) {
            throw new common_1.ForbiddenException('Only the assigned WAKA can decide on appeal');
        }
        if (pembinaanWaka.status !== 'appealed') {
            throw new common_1.BadRequestException(`Cannot decide on appeal. Current status is ${pembinaanWaka.status}. Must be 'appealed' to handle appeal.`);
        }
        pembinaanWaka.appeal_decision = appealDecision;
        pembinaanWaka.status = 'decided';
        pembinaanWaka.wak_decision = appealDecision;
        pembinaanWaka.student_acknowledged = false;
        pembinaanWaka.updated_by = waka_id;
        this.logger.log(`WAKA ${waka_id} decided on appeal for PembinaanWaka ${id}. New decision: ${appealDecision}`);
        return await this.pembinaanWakaRepository.save(pembinaanWaka);
    }
    async getWakaStatistics(waka_id) {
        const [pending, inReview, decided, executed, appealed, sp3Total, doTotal] = await Promise.all([
            this.pembinaanWakaRepository.count({
                where: { waka_id, status: 'pending' },
            }),
            this.pembinaanWakaRepository.count({
                where: { waka_id, status: 'in_review' },
            }),
            this.pembinaanWakaRepository.count({
                where: { waka_id, status: 'decided' },
            }),
            this.pembinaanWakaRepository.count({
                where: { waka_id, status: 'executed' },
            }),
            this.pembinaanWakaRepository.count({
                where: { waka_id, status: 'appealed' },
            }),
            this.pembinaanWakaRepository.count({
                where: { waka_id, wak_decision: 'sp3' },
            }),
            this.pembinaanWakaRepository.count({
                where: { waka_id, wak_decision: 'do' },
            }),
        ]);
        return {
            pending,
            inReview,
            decided,
            executed,
            appealed,
            sp3Total,
            doTotal,
        };
    }
    async update(id, dto) {
        const pembinaanWaka = await this.findOne(id);
        if (dto.notes !== undefined) {
            pembinaanWaka.notes = dto.notes ?? null;
        }
        if (dto.parent_notified !== undefined) {
            pembinaanWaka.parent_notified = dto.parent_notified;
        }
        if (dto.parent_notification_date !== undefined) {
            pembinaanWaka.parent_notification_date = dto.parent_notification_date ? new Date(dto.parent_notification_date) : null;
        }
        return await this.pembinaanWakaRepository.save(pembinaanWaka);
    }
};
exports.PembinaanWakaService = PembinaanWakaService;
exports.PembinaanWakaService = PembinaanWakaService = PembinaanWakaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(pembinaan_waka_entity_1.PembinaanWaka)),
    __param(1, (0, typeorm_1.InjectRepository)(reservasi_entity_1.Reservasi)),
    __param(2, (0, common_1.Optional)()),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => notification_service_1.NotificationService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        notification_service_1.NotificationService])
], PembinaanWakaService);
//# sourceMappingURL=pembinaan-waka.service.js.map