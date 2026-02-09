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
var ViolationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViolationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const walas_api_client_1 = require("../../walas/walas-api.client");
const violation_entity_1 = require("./entities/violation.entity");
const sp_pdf_service_1 = require("./sp-pdf.service");
let ViolationService = ViolationService_1 = class ViolationService {
    violationRepo;
    categoryRepo;
    spLetterRepo;
    progressionRepo;
    excuseRepo;
    statsRepo;
    spPdfService;
    walasApiClient;
    logger = new common_1.Logger(ViolationService_1.name);
    SP_RULES = {
        SP1: { violations_count: 3, sp_level: 1, consequences: 'Peringatan lisan dan tertulis' },
        SP2: { violations_count: 5, sp_level: 2, consequences: 'Peringatan tertulis dan pembatasan kegiatan' },
        SP3: { violations_count: 7, sp_level: 3, consequences: 'Peringatan akhir atau dirujuk untuk dibimbing intensif' },
        EXPULSION: { violations_count: 9, sp_level: 4, consequences: 'Dikeluarkan dari sekolah' },
    };
    constructor(violationRepo, categoryRepo, spLetterRepo, progressionRepo, excuseRepo, statsRepo, spPdfService, walasApiClient) {
        this.violationRepo = violationRepo;
        this.categoryRepo = categoryRepo;
        this.spLetterRepo = spLetterRepo;
        this.progressionRepo = progressionRepo;
        this.excuseRepo = excuseRepo;
        this.statsRepo = statsRepo;
        this.spPdfService = spPdfService;
        this.walasApiClient = walasApiClient;
    }
    async reportViolation(dto) {
        try {
            const violation = this.violationRepo.create({
                ...dto,
                severity: dto.severity || 1,
                is_processed: false,
            });
            const saved = await this.violationRepo.save(violation);
            await this.updateStatistics(dto.student_id);
            await this.checkAndGenerateSp(dto.student_id);
            return saved;
        }
        catch (error) {
            this.logger.error(`Failed to report violation: ${error.message}`);
            throw error;
        }
    }
    async syncViolationsFromWalas(startDate, endDate, forceSync = false) {
        try {
            this.logger.log(`Retrieving violations (${this.formatDate(startDate)} to ${this.formatDate(endDate)})`);
            const violationsData = await this.violationRepo.find({
                where: {
                    tanggal_pelanggaran: this.formatDate(startDate),
                },
            });
            if (!violationsData || violationsData.length === 0) {
                this.logger.log('No violations found to process');
                return {
                    success: true,
                    synced_violations: 0,
                    failed: 0,
                    errors: [],
                };
            }
            let syncedCount = 0;
            let failedCount = 0;
            const errors = [];
            for (const violation of violationsData) {
                try {
                    await this.updateStatistics(violation.student_id);
                    const spLetter = await this.checkAndGenerateSp(violation.student_id);
                    if (spLetter) {
                        this.logger.log(`SP letter generated for student ${violation.student_id}`);
                    }
                    syncedCount++;
                }
                catch (error) {
                    failedCount++;
                    errors.push({
                        student_id: violation.student_id,
                        error: error.message,
                    });
                    this.logger.error(`Failed to process violation for student ${violation.student_id}: ${error.message}`);
                }
            }
            this.logger.log(`Violations processing completed: ${syncedCount} processed, ${failedCount} failed`);
            return {
                success: true,
                synced_violations: syncedCount,
                failed: failedCount,
                errors: errors,
            };
        }
        catch (error) {
            this.logger.error(`Violations sync failed: ${error.message}`);
            return {
                success: false,
                synced_violations: 0,
                failed: 0,
                errors: [{ error: error.message }],
            };
        }
    }
    async getViolations(filters) {
        try {
            const page = filters.page || 1;
            const limit = filters.limit || 20;
            const skip = (page - 1) * limit;
            let query = this.violationRepo.createQueryBuilder('v');
            if (filters.student_id) {
                query = query.where('v.student_id = :student_id', {
                    student_id: filters.student_id,
                });
            }
            if (filters.class_id) {
                query = query.andWhere('v.class_id = :class_id', {
                    class_id: filters.class_id,
                });
            }
            if (filters.category_id) {
                query = query.andWhere('v.violation_category_id = :category_id', {
                    category_id: filters.category_id,
                });
            }
            if (filters.processed !== undefined) {
                query = query.andWhere('v.is_processed = :is_processed', {
                    is_processed: filters.processed,
                });
            }
            if (filters.date_from && filters.date_to) {
                query = query.andWhere('v.tanggal_pelanggaran BETWEEN :date_from AND :date_to', {
                    date_from: filters.date_from,
                    date_to: filters.date_to,
                });
            }
            const total = await query.getCount();
            const data = await query.orderBy('v.tanggal_pelanggaran', 'DESC').skip(skip).take(limit).getMany();
            return { data, total, page, limit };
        }
        catch (error) {
            this.logger.error(`Failed to get violations: ${error.message}`);
            throw error;
        }
    }
    async getUnprocessedViolations(student_id) {
        try {
            return this.violationRepo.find({
                where: {
                    student_id,
                    is_processed: false,
                },
                order: { tanggal_pelanggaran: 'DESC' },
            });
        }
        catch (error) {
            this.logger.error(`Failed to get unprocessed violations: ${error.message}`);
            throw error;
        }
    }
    async getSpProgression(student_id, tahun) {
        try {
            const year = tahun || new Date().getFullYear();
            let progression = await this.progressionRepo.findOne({
                where: { student_id, tahun: year },
            });
            if (!progression) {
                progression = this.progressionRepo.create({
                    student_id,
                    tahun: year,
                    current_sp_level: 0,
                    violation_count: 0,
                });
                await this.progressionRepo.save(progression);
            }
            return progression;
        }
        catch (error) {
            this.logger.error(`Failed to get SP progression: ${error.message}`);
            throw error;
        }
    }
    async getSpLetters(filters) {
        try {
            const page = filters.page || 1;
            const limit = filters.limit || 20;
            const skip = (page - 1) * limit;
            let query = this.spLetterRepo.createQueryBuilder('sp');
            if (filters.student_id) {
                query = query.where('sp.student_id = :student_id', {
                    student_id: filters.student_id,
                });
            }
            if (filters.sp_level) {
                query = query.andWhere('sp.sp_level = :sp_level', {
                    sp_level: filters.sp_level,
                });
            }
            if (filters.tahun) {
                query = query.andWhere('sp.tahun = :tahun', {
                    tahun: filters.tahun,
                });
            }
            if (filters.status) {
                query = query.andWhere('sp.status = :status', {
                    status: filters.status,
                });
            }
            const total = await query.getCount();
            const data = await query.orderBy('sp.tanggal_sp', 'DESC').skip(skip).take(limit).getMany();
            return { data, total, page, limit };
        }
        catch (error) {
            this.logger.error(`Failed to get SP letters: ${error.message}`);
            throw error;
        }
    }
    async checkAndGenerateSp(student_id) {
        try {
            const tahun = new Date().getFullYear();
            let progression = await this.getSpProgression(student_id, tahun);
            if (!progression) {
                progression = this.progressionRepo.create({ student_id, tahun, current_sp_level: 0 });
            }
            const unprocessedViolations = await this.getUnprocessedViolations(student_id);
            const totalViolations = await this.violationRepo.count({
                where: { student_id },
            });
            progression.violation_count = totalViolations;
            let shouldGenerateSp = false;
            let nextSpLevel = progression.current_sp_level + 1;
            if (totalViolations >= 3 && progression.current_sp_level === 0) {
                shouldGenerateSp = true;
                nextSpLevel = 1;
            }
            else if (totalViolations >= 5 && progression.current_sp_level < 2) {
                shouldGenerateSp = true;
                nextSpLevel = 2;
            }
            else if (totalViolations >= 7 && progression.current_sp_level < 3) {
                shouldGenerateSp = true;
                nextSpLevel = 3;
            }
            else if (totalViolations >= 9 && progression.current_sp_level === 3) {
                shouldGenerateSp = true;
                nextSpLevel = 4;
            }
            if (!shouldGenerateSp || unprocessedViolations.length === 0) {
                return null;
            }
            const spLetter = await this.generateSpLetter(student_id, nextSpLevel, unprocessedViolations);
            progression.current_sp_level = nextSpLevel === 4 ? 3 : nextSpLevel;
            if (nextSpLevel === 1)
                progression.sp1_issued_count++;
            if (nextSpLevel === 2)
                progression.sp2_issued_count++;
            if (nextSpLevel === 3)
                progression.sp3_issued_count++;
            progression.last_sp_date = new Date().toISOString().split('T')[0];
            if (!progression.first_sp_date) {
                progression.first_sp_date = progression.last_sp_date;
            }
            if (nextSpLevel === 4) {
                progression.is_expelled = true;
                progression.expulsion_date = new Date().toISOString().split('T')[0];
                progression.reason_if_expelled = 'SP3_escalation';
            }
            await this.progressionRepo.save(progression);
            return spLetter;
        }
        catch (error) {
            this.logger.error(`Failed to check and generate SP: ${error.message}`);
            throw error;
        }
    }
    async generateSpLetter(student_id, spLevel, violations) {
        try {
            const studentInfo = violations[0];
            const tahun = new Date().getFullYear();
            const spCount = await this.spLetterRepo.count({
                where: { tahun },
            });
            const spNumber = `SP/${tahun}/${String(spCount + 1).padStart(3, '0')}/PEL`;
            const consequencesMap = {
                1: 'Peringatan lisan dan tertulis kepada siswa. Orang tua diminta hadir untuk penandatanganan surat perjanjian.',
                2: 'Pembatasan kegiatan (tidak boleh ikut ekstrakurikuler, pameran, acara sekolah). Orang tua diminta hadir untuk penandatanganan surat perjanjian yang lebih keras.',
                3: 'Rujukan ke bimbingan konseling intensif atau pemulangan dari sekolah jika tidak ada perbaikan. Orang tua dan siswa diminta hadir untuk diskusi lanjutan.',
                4: 'Dikeluarkan dari sekolah berdasarkan keputusan rapat dewan guru.',
            };
            const violationsText = violations
                .map((v) => `${v.tanggal_pelanggaran}: ${v.description}`)
                .join('; ');
            const spLetter = this.spLetterRepo.create({
                student_id,
                student_name: studentInfo.student_name,
                class_id: studentInfo.class_id,
                nis: '',
                sp_level: spLevel,
                sp_number: spNumber,
                sp_type: 'PEL',
                tahun,
                violations_text: violationsText,
                violation_ids: JSON.stringify(violations.map((v) => v.id)),
                consequences: consequencesMap[spLevel] || consequencesMap[1],
                tanggal_sp: new Date().toISOString().split('T')[0],
                status: 'issued',
                is_signed: false,
                material_cost: 10000,
            });
            const saved = await this.spLetterRepo.save(spLetter);
            await this.violationRepo.update({ id: violations[0].id }, { is_processed: true, sp_letter_id: saved.id });
            return saved;
        }
        catch (error) {
            this.logger.error(`Failed to generate SP letter: ${error.message}`);
            throw error;
        }
    }
    async signSpLetter(sp_letter_id, signed_by_parent) {
        try {
            await this.spLetterRepo.update({ id: sp_letter_id }, {
                is_signed: true,
                signed_date: new Date().toISOString().split('T')[0],
                signed_by_parent,
                status: 'signed',
            });
            return this.spLetterRepo.findOne({
                where: { id: sp_letter_id },
            });
        }
        catch (error) {
            this.logger.error(`Failed to sign SP letter: ${error.message}`);
            throw error;
        }
    }
    async submitExcuse(dto) {
        try {
            const violation = await this.violationRepo.findOne({
                where: { id: dto.violation_id },
            });
            if (!violation) {
                throw new Error('Violation not found');
            }
            const excuse = this.excuseRepo.create({
                violation_id: dto.violation_id,
                student_id: violation.student_id,
                excuse_text: dto.excuse_text,
                bukti_excuse: dto.bukti_excuse,
                status: 'pending',
                is_resolved: false,
            });
            return this.excuseRepo.save(excuse);
        }
        catch (error) {
            this.logger.error(`Failed to submit excuse: ${error.message}`);
            throw error;
        }
    }
    async getExcuses(filters) {
        try {
            const page = filters.page || 1;
            const limit = filters.limit || 20;
            const skip = (page - 1) * limit;
            let query = this.excuseRepo.createQueryBuilder('ve');
            if (filters.student_id) {
                query = query.where('ve.student_id = :student_id', {
                    student_id: filters.student_id,
                });
            }
            if (filters.status) {
                query = query.andWhere('ve.status = :status', {
                    status: filters.status,
                });
            }
            if (filters.is_resolved !== undefined) {
                query = query.andWhere('ve.is_resolved = :is_resolved', {
                    is_resolved: filters.is_resolved,
                });
            }
            const total = await query.getCount();
            const data = await query.orderBy('ve.created_at', 'DESC').skip(skip).take(limit).getMany();
            return { data, total, page, limit };
        }
        catch (error) {
            this.logger.error(`Failed to get excuses: ${error.message}`);
            throw error;
        }
    }
    async reviewExcuse(dto) {
        try {
            const excuse = await this.excuseRepo.findOne({
                where: { id: dto.excuse_id },
            });
            if (!excuse) {
                throw new Error('Excuse not found');
            }
            await this.excuseRepo.update({ id: dto.excuse_id }, {
                status: dto.status,
                catatan_bk: dto.catatan_bk,
                is_resolved: true,
                resolved_by: dto.resolved_by,
                resolved_at: new Date(),
            });
            if (dto.status === 'accepted') {
                await this.violationRepo.update({ id: excuse.violation_id }, { is_processed: true });
                const violation = await this.violationRepo.findOne({
                    where: { id: excuse.violation_id },
                });
                if (violation) {
                    await this.updateStatistics(violation.student_id);
                }
            }
            return this.excuseRepo.findOne({ where: { id: dto.excuse_id } });
        }
        catch (error) {
            this.logger.error(`Failed to review excuse: ${error.message}`);
            throw error;
        }
    }
    async getStudentRiskLevel(student_id, tahun) {
        try {
            const year = tahun || new Date().getFullYear();
            const progression = await this.getSpProgression(student_id, year);
            if (!progression) {
                return {
                    risk_level: 'green',
                    violation_count: 0,
                    sp_level: 0,
                    is_expelled: false,
                };
            }
            let riskLevel = 'green';
            if (progression.violation_count >= 9) {
                riskLevel = 'red';
            }
            else if (progression.violation_count >= 6) {
                riskLevel = 'orange';
            }
            else if (progression.violation_count >= 3) {
                riskLevel = 'yellow';
            }
            return {
                risk_level: riskLevel,
                violation_count: progression.violation_count,
                sp_level: progression.current_sp_level,
                is_expelled: progression.is_expelled,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get risk level: ${error.message}`);
            throw error;
        }
    }
    async exportReport(student_id, tahun) {
        try {
            const year = tahun || new Date().getFullYear();
            const violations = await this.violationRepo.find({
                where: { student_id },
            });
            const spLetters = await this.spLetterRepo.find({
                where: { student_id, tahun: year },
            });
            const progression = await this.getSpProgression(student_id, year);
            return {
                student_id,
                tahun: year,
                totalViolations: violations.length,
                violationsList: violations,
                spLetters,
                progression,
                generatedAt: new Date(),
            };
        }
        catch (error) {
            this.logger.error(`Failed to export report: ${error.message}`);
            throw error;
        }
    }
    async updateStatistics(student_id, tahun) {
        try {
            const year = tahun || new Date().getFullYear();
            const violations = await this.violationRepo.find({
                where: { student_id },
            });
            const spLetters = await this.spLetterRepo.count({
                where: { student_id, tahun: year },
            });
            const totalSeverity = violations.reduce((sum, v) => sum + v.severity, 0);
            const avgSeverity = violations.length > 0 ? totalSeverity / violations.length : 0;
            let riskLevel = 'green';
            if (violations.length >= 9) {
                riskLevel = 'red';
            }
            else if (violations.length >= 6) {
                riskLevel = 'orange';
            }
            else if (violations.length >= 3) {
                riskLevel = 'yellow';
            }
            const existingStats = await this.statsRepo.findOne({
                where: { student_id, tahun: year },
            });
            if (existingStats) {
                await this.statsRepo.update({ student_id, tahun: year }, {
                    total_violations: violations.length,
                    total_severity_score: totalSeverity,
                    average_severity: avgSeverity,
                    sp_count: spLetters,
                    risk_level: riskLevel,
                });
            }
            else {
                const stats = this.statsRepo.create({
                    student_id,
                    tahun: year,
                    total_violations: violations.length,
                    total_severity_score: totalSeverity,
                    average_severity: avgSeverity,
                    sp_count: spLetters,
                    risk_level: riskLevel,
                });
                await this.statsRepo.save(stats);
            }
        }
        catch (error) {
            this.logger.error(`Failed to update statistics: ${error.message}`);
        }
    }
    formatDate(date) {
        if (typeof date === 'string') {
            return date.split('T')[0];
        }
        return date.toISOString().split('T')[0];
    }
};
exports.ViolationService = ViolationService;
exports.ViolationService = ViolationService = ViolationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(violation_entity_1.Violation)),
    __param(1, (0, typeorm_1.InjectRepository)(violation_entity_1.ViolationCategory)),
    __param(2, (0, typeorm_1.InjectRepository)(violation_entity_1.SpLetter)),
    __param(3, (0, typeorm_1.InjectRepository)(violation_entity_1.SpProgression)),
    __param(4, (0, typeorm_1.InjectRepository)(violation_entity_1.ViolationExcuse)),
    __param(5, (0, typeorm_1.InjectRepository)(violation_entity_1.ViolationStatistics)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        sp_pdf_service_1.SpPdfService,
        walas_api_client_1.WalasApiClient])
], ViolationService);
//# sourceMappingURL=violations.service.js.map