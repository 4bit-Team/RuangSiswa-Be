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
var LaporanBkService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LaporanBkService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const laporan_bk_entity_1 = require("./entities/laporan-bk.entity");
const reservasi_entity_1 = require("../reservasi/entities/reservasi.entity");
const notification_service_1 = require("../notifications/notification.service");
let LaporanBkService = LaporanBkService_1 = class LaporanBkService {
    laporanBkRepository;
    reservasiRepository;
    notificationService;
    logger = new common_1.Logger(LaporanBkService_1.name);
    constructor(laporanBkRepository, reservasiRepository, notificationService) {
        this.laporanBkRepository = laporanBkRepository;
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
        if (reservasi.pembinaanType !== 'ringan') {
            throw new common_1.BadRequestException('LaporanBK can only be created for "ringan" type pembinaan');
        }
        const laporan = this.laporanBkRepository.create({
            ...dto,
            status: 'ongoing',
            total_sessions: 0,
            parent_notified: false,
            escalated_to_waka: false,
        });
        return await this.laporanBkRepository.save(laporan);
    }
    async findAll() {
        return await this.laporanBkRepository.find({
            relations: ['reservasi', 'pembinaan', 'bk'],
            order: { created_at: 'DESC' },
        });
    }
    async findByBk(bk_id) {
        return await this.laporanBkRepository.find({
            where: { bk_id },
            relations: ['reservasi', 'pembinaan', 'bk'],
            order: { created_at: 'DESC' },
        });
    }
    async findOngoing() {
        return await this.laporanBkRepository.find({
            where: { status: 'ongoing' },
            relations: ['reservasi', 'pembinaan', 'bk'],
            order: { created_at: 'DESC' },
        });
    }
    async findPendingFollowUp() {
        return await this.laporanBkRepository.find({
            where: { follow_up_status: (0, typeorm_2.IsNull)() },
            relations: ['reservasi', 'pembinaan', 'bk'],
        });
    }
    async findOne(id) {
        const laporan = await this.laporanBkRepository.findOne({
            where: { id },
            relations: ['reservasi', 'pembinaan', 'bk'],
        });
        if (!laporan) {
            throw new common_1.NotFoundException(`LaporanBK with ID ${id} not found`);
        }
        return laporan;
    }
    async findByReservasiId(reservasi_id) {
        return await this.laporanBkRepository.findOne({
            where: { reservasi_id },
            relations: ['reservasi', 'pembinaan', 'bk'],
        });
    }
    async recordSession(id, dto, bk_id) {
        const laporan = await this.findOne(id);
        if (laporan.bk_id !== bk_id) {
            throw new common_1.BadRequestException('Only the assigned BK counselor can record sessions');
        }
        laporan.session_date = new Date(dto.session_date);
        if (dto.session_duration_minutes !== undefined) {
            laporan.session_duration_minutes = dto.session_duration_minutes;
        }
        laporan.session_type = dto.session_type || 'individu';
        if (dto.session_location !== undefined) {
            laporan.session_location = dto.session_location;
        }
        laporan.session_topic = dto.session_topic;
        laporan.session_notes = dto.session_notes;
        if (dto.student_response) {
            laporan.student_response = dto.student_response;
        }
        if (dto.student_understanding_level) {
            laporan.student_understanding_level = dto.student_understanding_level;
        }
        if (dto.student_participation_level) {
            laporan.student_participation_level = dto.student_participation_level;
        }
        if (dto.recommendations) {
            laporan.recommendations = dto.recommendations;
        }
        if (dto.follow_up_date) {
            laporan.follow_up_date = new Date(dto.follow_up_date);
        }
        laporan.total_sessions = (laporan.total_sessions || 0) + 1;
        laporan.updated_by = bk_id;
        const updated = await this.laporanBkRepository.save(laporan);
        try {
            if (this.notificationService) {
                await this.notificationService.create({
                    recipient_id: laporan.student_id,
                    type: 'session_recorded',
                    title: 'Sesi Konseling Tercatat',
                    message: `Sesi konseling BK telah dicatat. Topik: ${dto.session_topic || 'Umum'}. Silakan periksa status perkembangan Anda.`,
                    related_id: laporan.id,
                    related_type: 'laporan_bk',
                    metadata: {
                        student_id: laporan.student_id,
                        bk_id: bk_id,
                        session_date: dto.session_date,
                        session_topic: dto.session_topic,
                        total_sessions: laporan.total_sessions,
                    },
                });
                this.logger.log(`✅ Notification sent: session_recorded for student ${laporan.student_id}`);
            }
        }
        catch (error) {
            this.logger.warn(`Failed to create session_recorded notification: ${error.message}`);
        }
        this.logger.log(`BK ${bk_id} recorded session for LaporanBK ${id}`);
        return updated;
    }
    async markBehavioralImprovement(id, improved, bk_id) {
        const laporan = await this.findOne(id);
        if (laporan.bk_id !== bk_id) {
            throw new common_1.BadRequestException('Only the assigned BK counselor can update this');
        }
        laporan.behavioral_improvement = improved;
        laporan.updated_by = bk_id;
        return await this.laporanBkRepository.save(laporan);
    }
    async notifyParent(id, notification_content, bk_id) {
        const laporan = await this.findOne(id);
        if (laporan.bk_id !== bk_id) {
            throw new common_1.BadRequestException('Only the assigned BK counselor can notify parents');
        }
        laporan.parent_notified = true;
        laporan.parent_notification_date = new Date();
        laporan.parent_notification_content = notification_content;
        laporan.updated_by = bk_id;
        this.logger.log(`Parent notified for LaporanBK ${id} by BK ${bk_id}`);
        return await this.laporanBkRepository.save(laporan);
    }
    async completeFollowUp(id, follow_up_status, bk_id) {
        const laporan = await this.findOne(id);
        if (laporan.bk_id !== bk_id) {
            throw new common_1.BadRequestException('Only the assigned BK counselor can complete follow-up');
        }
        if (!laporan.follow_up_date) {
            throw new common_1.BadRequestException('No follow-up date set for this laporan');
        }
        laporan.follow_up_status = follow_up_status;
        laporan.updated_by = bk_id;
        this.logger.log(`Follow-up completed for LaporanBK ${id}: ${follow_up_status}`);
        return await this.laporanBkRepository.save(laporan);
    }
    async escalateToWaka(id, dto, bk_id) {
        const laporan = await this.findOne(id);
        if (laporan.bk_id !== bk_id) {
            throw new common_1.BadRequestException('Only the assigned BK counselor can escalate');
        }
        if (laporan.escalated_to_waka) {
            throw new common_1.BadRequestException('This laporan has already been escalated to WAKA');
        }
        laporan.escalated_to_waka = true;
        laporan.escalation_reason = dto.escalation_reason;
        laporan.escalation_date = new Date();
        if (dto.final_assessment !== undefined) {
            laporan.final_assessment = dto.final_assessment;
        }
        laporan.status = 'needs_escalation';
        laporan.updated_by = bk_id;
        const updated = await this.laporanBkRepository.save(laporan);
        try {
            if (this.notificationService) {
                await this.notificationService.create({
                    recipient_id: laporan.student_id,
                    type: 'escalation_to_waka',
                    title: 'Kasus Ditingkatkan ke WAKA',
                    message: `Kasus pembinaan ringan Anda telah ditingkatkan ke WAKA (Wakil Kepala Sekolah Kesiswaan). Alasan: ${dto.escalation_reason || 'Sesuai protokol'}`,
                    related_id: laporan.id,
                    related_type: 'laporan_bk',
                    metadata: {
                        student_id: laporan.student_id,
                        bk_id: bk_id,
                        escalation_reason: dto.escalation_reason,
                        total_sessions: laporan.total_sessions,
                    },
                });
                this.logger.log(`✅ Notification sent: escalation_to_waka for student ${laporan.student_id}`);
            }
        }
        catch (error) {
            this.logger.warn(`Failed to create escalation_to_waka notification: ${error.message}`);
        }
        this.logger.log(`LaporanBK ${id} escalated to WAKA by BK ${bk_id}. Reason: ${dto.escalation_reason}`);
        return updated;
    }
    async complete(id, final_assessment, bk_id) {
        const laporan = await this.findOne(id);
        if (laporan.bk_id !== bk_id) {
            throw new common_1.BadRequestException('Only the assigned BK counselor can complete this');
        }
        laporan.status = 'completed';
        laporan.final_assessment = final_assessment || laporan.final_assessment;
        laporan.updated_by = bk_id;
        this.logger.log(`LaporanBK ${id} marked as completed by BK ${bk_id}`);
        return await this.laporanBkRepository.save(laporan);
    }
    async update(id, dto) {
        const laporan = await this.findOne(id);
        Object.assign(laporan, dto);
        return await this.laporanBkRepository.save(laporan);
    }
    async archive(id) {
        const laporan = await this.findOne(id);
        laporan.status = 'archived';
        return await this.laporanBkRepository.save(laporan);
    }
    async getBkStatistics(bk_id) {
        const [totalLaporan, ongoing, completed, escalated, needsFollowUp, totalSessions, behavioralImprovement] = await Promise.all([
            this.laporanBkRepository.count({ where: { bk_id } }),
            this.laporanBkRepository.count({ where: { bk_id, status: 'ongoing' } }),
            this.laporanBkRepository.count({ where: { bk_id, status: 'completed' } }),
            this.laporanBkRepository.count({ where: { bk_id, escalated_to_waka: true } }),
            this.laporanBkRepository.count({ where: { bk_id, follow_up_status: (0, typeorm_2.IsNull)(), status: 'completed' } }),
            this.laporanBkRepository
                .createQueryBuilder('laporan')
                .where('laporan.bk_id = :bk_id', { bk_id })
                .select('SUM(laporan.total_sessions)', 'sum')
                .getRawOne(),
            this.laporanBkRepository.count({ where: { bk_id, behavioral_improvement: true } }),
        ]);
        return {
            totalLaporan,
            ongoing,
            completed,
            escalated,
            needsFollowUp,
            totalSessions: totalSessions?.sum || 0,
            behavioralImprovement,
        };
    }
    async getOverallStatistics() {
        const [totalLaporan, ongoing, completed, escalated, parentNotified] = await Promise.all([
            this.laporanBkRepository.count(),
            this.laporanBkRepository.count({ where: { status: 'ongoing' } }),
            this.laporanBkRepository.count({ where: { status: 'completed' } }),
            this.laporanBkRepository.count({ where: { escalated_to_waka: true } }),
            this.laporanBkRepository.count({ where: { parent_notified: true } }),
        ]);
        const avgSessionsQueryResult = await this.laporanBkRepository
            .createQueryBuilder('laporan')
            .select('AVG(laporan.total_sessions)', 'avg')
            .getRawOne();
        return {
            totalLaporan,
            ongoing,
            completed,
            escalated,
            avgSessionsPerLaporan: parseFloat(avgSessionsQueryResult?.avg || 0).toFixed(2),
            parentNotificationRate: totalLaporan > 0 ? Math.round((parentNotified / totalLaporan) * 100) : 0,
        };
    }
};
exports.LaporanBkService = LaporanBkService;
exports.LaporanBkService = LaporanBkService = LaporanBkService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(laporan_bk_entity_1.LaporanBk)),
    __param(1, (0, typeorm_1.InjectRepository)(reservasi_entity_1.Reservasi)),
    __param(2, (0, common_1.Optional)()),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => notification_service_1.NotificationService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        notification_service_1.NotificationService])
], LaporanBkService);
//# sourceMappingURL=laporan-bk.service.js.map