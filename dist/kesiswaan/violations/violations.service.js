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
    logger = new common_1.Logger(ViolationService_1.name);
    SP_RULES = {
        SP1: { violations_count: 3, sp_level: 1, consequences: 'Peringatan lisan dan tertulis' },
        SP2: { violations_count: 5, sp_level: 2, consequences: 'Peringatan tertulis dan pembatasan kegiatan' },
        SP3: { violations_count: 7, sp_level: 3, consequences: 'Peringatan akhir atau dirujuk untuk dibimbing intensif' },
        EXPULSION: { violations_count: 9, sp_level: 4, consequences: 'Dikeluarkan dari sekolah' },
    };
    constructor(violationRepo, categoryRepo, spLetterRepo, progressionRepo, excuseRepo, statsRepo, spPdfService) {
        this.violationRepo = violationRepo;
        this.categoryRepo = categoryRepo;
        this.spLetterRepo = spLetterRepo;
        this.progressionRepo = progressionRepo;
        this.excuseRepo = excuseRepo;
        this.statsRepo = statsRepo;
        this.spPdfService = spPdfService;
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
            const prog = progression;
            const unprocessedViolations = await this.getUnprocessedViolations(student_id);
            const totalViolations = await this.violationRepo.count({
                where: { student_id },
            });
            prog.violation_count = totalViolations;
            let shouldGenerateSp = false;
            let nextSpLevel = prog.current_sp_level + 1;
            if (totalViolations >= 3 && prog.current_sp_level === 0) {
                shouldGenerateSp = true;
                nextSpLevel = 1;
            }
            else if (totalViolations >= 5 && prog.current_sp_level < 2) {
                shouldGenerateSp = true;
                nextSpLevel = 2;
            }
            else if (totalViolations >= 7 && prog.current_sp_level < 3) {
                shouldGenerateSp = true;
                nextSpLevel = 3;
            }
            else if (totalViolations >= 9 && prog.current_sp_level === 3) {
                shouldGenerateSp = true;
                nextSpLevel = 4;
            }
            if (!shouldGenerateSp || unprocessedViolations.length === 0) {
                return null;
            }
            const spLetter = await this.generateSpLetter(student_id, nextSpLevel, unprocessedViolations);
            prog.current_sp_level = nextSpLevel === 4 ? 3 : nextSpLevel;
            if (nextSpLevel === 1)
                prog.sp1_issued_count++;
            if (nextSpLevel === 2)
                prog.sp2_issued_count++;
            if (nextSpLevel === 3)
                prog.sp3_issued_count++;
            prog.last_sp_date = new Date().toISOString().split('T')[0];
            if (!prog.first_sp_date) {
                prog.first_sp_date = prog.last_sp_date;
            }
            if (nextSpLevel === 4) {
                prog.is_expelled = true;
                prog.expulsion_date = new Date().toISOString().split('T')[0];
                prog.reason_if_expelled = 'SP3_escalation';
            }
            await this.progressionRepo.save(prog);
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
            await this.violationRepo.update({ id: violations[0].id }, { is_processed: true, sp_letter_id: saved[0]?.id || saved.id });
            return Array.isArray(saved) ? saved[0] : saved;
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
        sp_pdf_service_1.SpPdfService])
], ViolationService);
//# sourceMappingURL=violations.service.js.map