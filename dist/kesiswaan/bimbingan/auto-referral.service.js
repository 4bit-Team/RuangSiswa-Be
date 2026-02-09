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
var AutoReferralService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoReferralService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bimbingan_entity_1 = require("./entities/bimbingan.entity");
const bimbingan_service_1 = require("./bimbingan.service");
let AutoReferralService = AutoReferralService_1 = class AutoReferralService {
    referralRepository;
    bimbinganService;
    logger = new common_1.Logger(AutoReferralService_1.name);
    constructor(referralRepository, bimbinganService) {
        this.referralRepository = referralRepository;
        this.bimbinganService = bimbinganService;
    }
    async handleViolationReferral(studentId, studentName, spLevel, violationCount, violationDetails, tahun) {
        try {
            const existingReferral = await this.referralRepository.findOne({
                where: {
                    student_id: studentId,
                    tahun,
                    referral_reason: 'SP escalation',
                },
            });
            if (existingReferral) {
                this.logger.warn(`Referral already exists for student ${studentId}, violation escalation skipped`);
                return existingReferral;
            }
            const riskLevel = spLevel === 'SP3' ? 'red' : spLevel === 'SP2' ? 'orange' : 'yellow';
            const referralDto = {
                student_id: studentId,
                student_name: studentName,
                class_id: 0,
                tahun,
                referral_reason: `Student issued ${spLevel} due to repeated violations (Total: ${violationCount})`,
                risk_level: riskLevel,
                is_urgent: spLevel === 'SP3',
                referral_source: {
                    source: 'violations_escalation',
                    source_id: '',
                    details: `SP ${spLevel} issued with ${violationCount} total violations. Details: ${violationDetails}`,
                },
                notes: `Auto-generated referral from SP ${spLevel} escalation. Student has ${violationCount} total violations.`,
            };
            const referral = await this.bimbinganService.createReferral(referralDto);
            this.logger.log(`Violation referral created for student ${studentId} (${spLevel}) with risk level ${riskLevel}`);
            return referral;
        }
        catch (error) {
            this.logger.error(`Failed to create violation referral for student ${studentId}: ${error.message}`);
            throw error;
        }
    }
    async handleTardinessReferral(studentId, studentName, tardinessCount, rejectedAppealCount, tahun) {
        try {
            const existingReferral = await this.referralRepository.findOne({
                where: {
                    student_id: studentId,
                    tahun,
                    referral_reason: 'Chronic tardiness',
                },
            });
            if (existingReferral) {
                this.logger.warn(`Tardiness referral already exists for student ${studentId}, skipped`);
                return existingReferral;
            }
            const riskLevel = tardinessCount >= 10 ? 'red' : tardinessCount >= 7 ? 'orange' : 'yellow';
            const referralDto = {
                student_id: studentId,
                student_name: studentName,
                class_id: 0,
                tahun,
                referral_reason: `Student has chronic tardiness (${tardinessCount} times, ${rejectedAppealCount} appeals rejected)`,
                risk_level: riskLevel,
                is_urgent: riskLevel === 'red',
                referral_source: {
                    source: 'tardiness_escalation',
                    source_id: '',
                    details: `Tardiness records: ${tardinessCount}, Rejected appeals: ${rejectedAppealCount}`,
                },
                notes: `Auto-generated from repeated tardiness. ${tardinessCount} total tardiness records with ${rejectedAppealCount} rejected appeals.`,
            };
            const referral = await this.bimbinganService.createReferral(referralDto);
            this.logger.log(`Tardiness referral created for student ${studentId} (${tardinessCount} times) with risk level ${riskLevel}`);
            return referral;
        }
        catch (error) {
            this.logger.error(`Failed to create tardiness referral for student ${studentId}: ${error.message}`);
            throw error;
        }
    }
    async handleAttendanceReferral(studentId, studentName, attendanceRate, totalAbsences, totalDaysInSchool, tahun) {
        try {
            const existingReferral = await this.referralRepository.findOne({
                where: {
                    student_id: studentId,
                    tahun,
                    referral_reason: 'Chronic absence',
                },
            });
            if (existingReferral) {
                this.logger.warn(`Attendance referral already exists for student ${studentId}, skipped`);
                return existingReferral;
            }
            let riskLevel = 'yellow';
            if (attendanceRate < 50)
                riskLevel = 'red';
            else if (attendanceRate < 60)
                riskLevel = 'orange';
            else if (attendanceRate < 75)
                riskLevel = 'yellow';
            const referralDto = {
                student_id: studentId,
                student_name: studentName,
                class_id: 0,
                tahun,
                referral_reason: `Student has chronic absence (Attendance rate: ${attendanceRate.toFixed(2)}% - ${totalAbsences} days absent out of ${totalDaysInSchool} school days)`,
                risk_level: riskLevel,
                is_urgent: riskLevel === 'red',
                referral_source: {
                    source: 'attendance_escalation',
                    source_id: '',
                    details: `Attendance rate: ${attendanceRate.toFixed(2)}%, Absences: ${totalAbsences} of ${totalDaysInSchool} days`,
                },
                notes: `Auto-generated from chronic absence. Attendance rate ${attendanceRate.toFixed(2)}% with ${totalAbsences} absences out of ${totalDaysInSchool} school days.`,
            };
            const referral = await this.bimbinganService.createReferral(referralDto);
            this.logger.log(`Attendance referral created for student ${studentId} (${attendanceRate.toFixed(2)}% attendance) with risk level ${riskLevel}`);
            return referral;
        }
        catch (error) {
            this.logger.error(`Failed to create attendance referral for student ${studentId}: ${error.message}`);
            throw error;
        }
    }
    async handleAcademicReferral(studentId, studentName, gpa, failingSubjectsCount, tahun) {
        try {
            const existingReferral = await this.referralRepository.findOne({
                where: {
                    student_id: studentId,
                    tahun,
                    referral_reason: 'Academic underperformance',
                },
            });
            if (existingReferral) {
                this.logger.warn(`Academic referral already exists for student ${studentId}, skipped`);
                return existingReferral;
            }
            let riskLevel = 'yellow';
            if (gpa < 1.5 || failingSubjectsCount > 3)
                riskLevel = 'red';
            else if (gpa < 2.0 || failingSubjectsCount > 1)
                riskLevel = 'orange';
            const referralDto = {
                student_id: studentId,
                student_name: studentName,
                class_id: 0,
                tahun,
                referral_reason: `Student has academic underperformance (GPA: ${gpa.toFixed(2)}, Failing subjects: ${failingSubjectsCount})`,
                risk_level: riskLevel,
                is_urgent: riskLevel === 'red',
                referral_source: {
                    source: 'academic_underperformance',
                    source_id: '',
                    details: `GPA: ${gpa.toFixed(2)}, Failing subjects: ${failingSubjectsCount}`,
                },
                notes: `Auto-generated from academic underperformance. GPA ${gpa.toFixed(2)} with ${failingSubjectsCount} failing subjects.`,
            };
            const referral = await this.bimbinganService.createReferral(referralDto);
            this.logger.log(`Academic referral created for student ${studentId} (GPA: ${gpa.toFixed(2)}) with risk level ${riskLevel}`);
            return referral;
        }
        catch (error) {
            this.logger.error(`Failed to create academic referral for student ${studentId}: ${error.message}`);
            throw error;
        }
    }
    async periodicCheckAndReferral(tahun) {
        try {
            this.logger.log(`Starting periodic referral check for tahun ${tahun}`);
            this.logger.log(`Periodic referral check completed for tahun ${tahun}`);
            return { message: 'Periodic check completed', timestamp: new Date() };
        }
        catch (error) {
            this.logger.error(`Periodic referral check failed: ${error.message}`);
            throw error;
        }
    }
    async getAtRiskStudentsSummary(tahun) {
        try {
            const query = this.referralRepository
                .createQueryBuilder('ref')
                .where('ref.tahun = :tahun', { tahun })
                .andWhere('ref.risk_level IN (:...riskLevels)', {
                riskLevels: ['red', 'orange'],
            })
                .orderBy('ref.risk_level', 'DESC')
                .addOrderBy('ref.referral_date', 'DESC');
            const results = await query.getMany();
            return {
                total: results.length,
                by_risk_level: {
                    red: results.filter((r) => r.risk_level === 'red').length,
                    orange: results.filter((r) => r.risk_level === 'orange').length,
                },
                by_source: {
                    violations: results.filter((r) => {
                        const src = typeof r.referral_source === 'object' ? r.referral_source?.source : r.referral_source;
                        return src === 'violations_escalation';
                    }).length,
                    tardiness: results.filter((r) => {
                        const src = typeof r.referral_source === 'object' ? r.referral_source?.source : r.referral_source;
                        return src === 'tardiness_escalation';
                    }).length,
                    attendance: results.filter((r) => {
                        const src = typeof r.referral_source === 'object' ? r.referral_source?.source : r.referral_source;
                        return src === 'attendance_escalation';
                    }).length,
                    academic: results.filter((r) => {
                        const src = typeof r.referral_source === 'object' ? r.referral_source?.source : r.referral_source;
                        return src === 'academic_underperformance';
                    }).length,
                },
                students: results.map((r) => ({
                    id: r.id,
                    student_id: r.student_id,
                    student_name: r.student_name,
                    risk_level: r.risk_level,
                    source: typeof r.referral_source === 'object' ? r.referral_source?.source : r.referral_source,
                    status: r.status,
                    referral_date: r.referral_date,
                    assigned_to: r.counselor_name || 'Unassigned',
                })),
            };
        }
        catch (error) {
            this.logger.error(`Failed to get at-risk students summary: ${error.message}`);
            throw error;
        }
    }
    async deactivateReferral(studentId, tahun, reason) {
        try {
            const referral = await this.referralRepository.findOne({
                where: {
                    student_id: studentId,
                    tahun,
                    status: 'in_progress',
                },
            });
            if (!referral) {
                this.logger.warn(`No active referral found for student ${studentId}`);
                return null;
            }
            referral.status = 'completed';
            referral.completed_date = new Date();
            referral.notes = `${referral.notes || ''} [Deactivated: ${reason}]`;
            await this.referralRepository.save(referral);
            this.logger.log(`Referral deactivated for student ${studentId}: ${reason}`);
            return referral;
        }
        catch (error) {
            this.logger.error(`Failed to deactivate referral for student ${studentId}: ${error.message}`);
            throw error;
        }
    }
};
exports.AutoReferralService = AutoReferralService;
exports.AutoReferralService = AutoReferralService = AutoReferralService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(bimbingan_entity_1.BimbinganReferral)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        bimbingan_service_1.BimbinganService])
], AutoReferralService);
//# sourceMappingURL=auto-referral.service.js.map