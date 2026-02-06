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
var TardinessService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TardinessService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tardiness_entity_1 = require("./entities/tardiness.entity");
let TardinessService = TardinessService_1 = class TardinessService {
    recordRepo;
    appealRepo;
    summaryRepo;
    alertRepo;
    patternRepo;
    logger = new common_1.Logger(TardinessService_1.name);
    constructor(recordRepo, appealRepo, summaryRepo, alertRepo, patternRepo) {
        this.recordRepo = recordRepo;
        this.appealRepo = appealRepo;
        this.summaryRepo = summaryRepo;
        this.alertRepo = alertRepo;
        this.patternRepo = patternRepo;
    }
    async submitTardiness(dto) {
        try {
            const existing = await this.recordRepo.findOne({
                where: {
                    student_id: dto.student_id,
                    tanggal: dto.tanggal,
                },
            });
            if (existing) {
                throw new Error(`Tardiness record already exists for student ${dto.student_id} on ${dto.tanggal}`);
            }
            const record = this.recordRepo.create({
                ...dto,
                status: 'submitted',
                has_appeal: false,
            });
            const saved = await this.recordRepo.save(record);
            await this.updateMonthlySummary(dto.student_id, dto.class_id, dto.tanggal);
            return saved;
        }
        catch (error) {
            this.logger.error(`Failed to submit tardiness: ${error.message}`);
            throw error;
        }
    }
    async getTardinessRecords(filters) {
        try {
            const page = filters.page || 1;
            const limit = filters.limit || 20;
            const skip = (page - 1) * limit;
            let query = this.recordRepo.createQueryBuilder('tr');
            if (filters.student_id) {
                query = query.where('tr.student_id = :student_id', {
                    student_id: filters.student_id,
                });
            }
            if (filters.class_id) {
                query = query.andWhere('tr.class_id = :class_id', {
                    class_id: filters.class_id,
                });
            }
            if (filters.status) {
                query = query.andWhere('tr.status = :status', {
                    status: filters.status,
                });
            }
            if (filters.date_from && filters.date_to) {
                query = query.andWhere('tr.tanggal BETWEEN :date_from AND :date_to', {
                    date_from: filters.date_from,
                    date_to: filters.date_to,
                });
            }
            const total = await query.getCount();
            const data = await query.orderBy('tr.tanggal', 'DESC').skip(skip).take(limit).getMany();
            return { data, total, page, limit };
        }
        catch (error) {
            this.logger.error(`Failed to get tardiness records: ${error.message}`);
            throw error;
        }
    }
    async getTardinessSummary(student_id, tahun_bulan) {
        try {
            const month = tahun_bulan || this.getCurrentYearMonth();
            let summary = await this.summaryRepo.findOne({
                where: {
                    student_id,
                    tahun_bulan: month,
                },
            });
            if (!summary) {
                const [year, monthNum] = month.split('-');
                const startDate = `${year}-${monthNum}-01`;
                const endDate = new Date(parseInt(year), parseInt(monthNum), 0).toISOString().split('T')[0];
                const records = await this.recordRepo.find({
                    where: {
                        student_id,
                        tanggal: (0, typeorm_2.Between)(startDate, endDate),
                    },
                });
                summary = this.calculateSummary(student_id, records, month);
            }
            return summary;
        }
        catch (error) {
            this.logger.error(`Failed to get tardiness summary: ${error.message}`);
            throw error;
        }
    }
    async getTardinessHistory(student_id, months = 6) {
        try {
            const summaries = [];
            for (let i = months - 1; i >= 0; i--) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                const tahun_bulan = date.toISOString().slice(0, 7);
                const summary = await this.getTardinessSummary(student_id, tahun_bulan);
                if (summary) {
                    summaries.push(summary);
                }
            }
            return summaries;
        }
        catch (error) {
            this.logger.error(`Failed to get tardiness history: ${error.message}`);
            throw error;
        }
    }
    async appealTardiness(dto) {
        try {
            const record = await this.recordRepo.findOne({
                where: { id: dto.tardiness_record_id },
            });
            if (!record) {
                throw new Error('Tardiness record not found');
            }
            const appeal = this.appealRepo.create({
                tardiness_record_id: dto.tardiness_record_id,
                student_id: record.student_id,
                alasan_appeal: dto.alasan_appeal,
                bukti_appeal: dto.bukti_appeal,
                status: 'pending',
                is_resolved: false,
            });
            const saved = await this.appealRepo.save(appeal);
            await this.recordRepo.update({ id: dto.tardiness_record_id }, { has_appeal: true });
            return saved;
        }
        catch (error) {
            this.logger.error(`Failed to appeal tardiness: ${error.message}`);
            throw error;
        }
    }
    async getStudentAppeals(student_id, filters) {
        try {
            let query = this.appealRepo.createQueryBuilder('ta').where('ta.student_id = :student_id', {
                student_id,
            });
            if (filters?.status) {
                query = query.andWhere('ta.status = :status', { status: filters.status });
            }
            if (filters?.is_resolved !== undefined) {
                query = query.andWhere('ta.is_resolved = :is_resolved', {
                    is_resolved: filters.is_resolved,
                });
            }
            return query.orderBy('ta.created_at', 'DESC').getMany();
        }
        catch (error) {
            this.logger.error(`Failed to get student appeals: ${error.message}`);
            throw error;
        }
    }
    async reviewAppeal(dto) {
        try {
            const appeal = await this.appealRepo.findOne({
                where: { id: dto.appeal_id },
            });
            if (!appeal) {
                throw new Error('Appeal not found');
            }
            await this.appealRepo.update({ id: dto.appeal_id }, {
                status: dto.status,
                catatan_bk: dto.catatan_bk,
                is_resolved: true,
                resolved_by: dto.resolved_by,
                resolved_at: new Date(),
            });
            if (dto.status === 'accepted') {
                await this.recordRepo.update({ id: appeal.tardiness_record_id }, { status: 'resolved' });
            }
            const record = await this.recordRepo.findOne({
                where: { id: appeal.tardiness_record_id },
            });
            if (record) {
                await this.updateMonthlySummary(record.student_id, record.class_id, record.tanggal);
            }
            return this.appealRepo.findOne({ where: { id: dto.appeal_id } });
        }
        catch (error) {
            this.logger.error(`Failed to review appeal: ${error.message}`);
            throw error;
        }
    }
    async generateTardinessAlerts() {
        try {
            const result = {
                submitted: 0,
                verified: 0,
                failed: 0,
                errors: [],
            };
            const currentMonth = this.getCurrentYearMonth();
            const flaggedSummaries = await this.summaryRepo.find({
                where: {
                    tahun_bulan: currentMonth,
                    is_flagged: true,
                },
            });
            for (const summary of flaggedSummaries) {
                try {
                    const existingAlert = await this.alertRepo.findOne({
                        where: {
                            student_id: summary.student_id,
                            alert_type: 'high_tardiness',
                        },
                    });
                    if (!existingAlert) {
                        const alert = this.alertRepo.create({
                            student_id: summary.student_id,
                            student_name: '',
                            alert_type: 'high_tardiness',
                            description: `Student has ${summary.count_total} tardiness incidents in ${currentMonth}`,
                            severity: summary.count_total >= 5 ? 'critical' : 'warning',
                            alert_data: JSON.stringify({
                                month: currentMonth,
                                count_total: summary.count_total,
                                total_menit: summary.total_menit,
                            }),
                            is_resolved: false,
                        });
                        await this.alertRepo.save(alert);
                        result.submitted++;
                    }
                }
                catch (error) {
                    result.failed++;
                    result.errors.push(`Failed to create alert for student ${summary.student_id}: ${error.message}`);
                }
            }
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to generate alerts: ${error.message}`);
            throw error;
        }
    }
    async getUnresolvedAlerts(filters) {
        try {
            let query = this.alertRepo.createQueryBuilder('ta').where('ta.is_resolved = false');
            if (filters?.student_id) {
                query = query.andWhere('ta.student_id = :student_id', {
                    student_id: filters.student_id,
                });
            }
            if (filters?.severity) {
                query = query.andWhere('ta.severity = :severity', {
                    severity: filters.severity,
                });
            }
            return query.orderBy('ta.created_at', 'DESC').getMany();
        }
        catch (error) {
            this.logger.error(`Failed to get unresolved alerts: ${error.message}`);
            throw error;
        }
    }
    async resolveAlert(alert_id, resolved_by) {
        try {
            await this.alertRepo.update({ id: alert_id }, {
                is_resolved: true,
                resolved_by,
                resolved_at: new Date(),
            });
            return this.alertRepo.findOne({ where: { id: alert_id } });
        }
        catch (error) {
            this.logger.error(`Failed to resolve alert: ${error.message}`);
            throw error;
        }
    }
    async detectPatterns(student_id) {
        try {
            const patterns = [];
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
            const records = await this.recordRepo.find({
                where: {
                    student_id,
                    tanggal: (0, typeorm_2.Between)(threeMonthsAgo.toISOString().split('T')[0], new Date().toISOString().split('T')[0]),
                },
            });
            if (records.length === 0) {
                return patterns;
            }
            const dayOfWeekCounts = {};
            records.forEach((record) => {
                const day = new Date(record.tanggal).getDay();
                dayOfWeekCounts[day] = (dayOfWeekCounts[day] || 0) + 1;
            });
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            for (const [day, count] of Object.entries(dayOfWeekCounts)) {
                if (count >= 2) {
                    patterns.push({
                        id: `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        student_id,
                        pattern_type: 'day_of_week',
                        pattern_description: `Often late on ${dayNames[parseInt(day)]}`,
                        confidence_score: Math.min(count / records.length, 1),
                        occurrences: count,
                        created_at: new Date(),
                        updated_at: new Date(),
                    });
                }
            }
            const minMinutes = Math.min(...records.map((r) => r.keterlambatan_menit));
            const maxMinutes = Math.max(...records.map((r) => r.keterlambatan_menit));
            if (maxMinutes - minMinutes <= 5 && maxMinutes >= 10) {
                patterns.push({
                    id: `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    student_id,
                    pattern_type: 'time_period',
                    pattern_description: `Consistently ${minMinutes}-${maxMinutes} minutes late`,
                    confidence_score: 0.8,
                    occurrences: records.length,
                    created_at: new Date(),
                    updated_at: new Date(),
                });
            }
            for (const pattern of patterns) {
                await this.patternRepo.delete({
                    student_id,
                    pattern_type: pattern.pattern_type,
                });
                await this.patternRepo.save(pattern);
            }
            return patterns;
        }
        catch (error) {
            this.logger.error(`Failed to detect patterns: ${error.message}`);
            throw error;
        }
    }
    async exportReport(student_id, month) {
        try {
            const summary = await this.getTardinessSummary(student_id, month);
            const records = await this.recordRepo.find({
                where: {
                    student_id,
                    tanggal: (0, typeorm_2.Between)(`${month}-01`, `${month}-31`),
                },
            });
            return {
                summary,
                records,
                generatedAt: new Date(),
            };
        }
        catch (error) {
            this.logger.error(`Failed to export report: ${error.message}`);
            throw error;
        }
    }
    getCurrentYearMonth() {
        const now = new Date();
        return now.toISOString().slice(0, 7);
    }
    async updateMonthlySummary(student_id, class_id, tanggal) {
        try {
            const [year, month] = tanggal.split('-');
            const tahun_bulan = `${year}-${month}`;
            const startDate = `${year}-${month}-01`;
            const endDate = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0];
            const records = await this.recordRepo.find({
                where: {
                    student_id,
                    tanggal: (0, typeorm_2.Between)(startDate, endDate),
                },
            });
            const summary = this.calculateSummary(student_id, records, tahun_bulan);
            const existing = await this.summaryRepo.findOne({
                where: { student_id, tahun_bulan },
            });
            if (existing) {
                await this.summaryRepo.update({ student_id, tahun_bulan }, summary);
            }
            else {
                const newSummary = this.summaryRepo.create({
                    student_id,
                    class_id,
                    ...summary,
                });
                await this.summaryRepo.save(newSummary);
            }
        }
        catch (error) {
            this.logger.error(`Failed to update summary: ${error.message}`);
        }
    }
    calculateSummary(student_id, records, tahun_bulan) {
        const count_total = records.length;
        const count_verified = records.filter((r) => r.status === 'verified').length;
        const count_disputed = records.filter((r) => r.has_appeal).length;
        const total_menit = records.reduce((sum, r) => sum + r.keterlambatan_menit, 0);
        let threshold_status = 'ok';
        if (count_total >= 5) {
            threshold_status = 'critical';
        }
        else if (count_total >= 3) {
            threshold_status = 'warning';
        }
        const is_flagged = count_total >= 5;
        return {
            tahun_bulan,
            count_total,
            count_verified,
            count_disputed,
            total_menit,
            threshold_status,
            is_flagged,
            reason_if_flagged: is_flagged ? `${count_total} tardiness incidents recorded` : undefined,
        };
    }
};
exports.TardinessService = TardinessService;
exports.TardinessService = TardinessService = TardinessService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tardiness_entity_1.TardinessRecord)),
    __param(1, (0, typeorm_1.InjectRepository)(tardiness_entity_1.TardinessAppeal)),
    __param(2, (0, typeorm_1.InjectRepository)(tardiness_entity_1.TardinessSummary)),
    __param(3, (0, typeorm_1.InjectRepository)(tardiness_entity_1.TardinessAlert)),
    __param(4, (0, typeorm_1.InjectRepository)(tardiness_entity_1.TardinessPattern)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], TardinessService);
//# sourceMappingURL=tardiness.service.js.map