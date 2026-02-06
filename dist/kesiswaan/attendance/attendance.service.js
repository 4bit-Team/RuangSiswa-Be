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
var AttendanceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const walas_api_client_1 = require("../../walas/walas-api.client");
const attendance_record_entity_1 = require("./entities/attendance-record.entity");
const attendance_summary_entity_1 = require("./entities/attendance-summary.entity");
const attendance_alert_entity_1 = require("./entities/attendance-alert.entity");
let AttendanceService = AttendanceService_1 = class AttendanceService {
    attendanceRecordRepo;
    attendanceSummaryRepo;
    attendanceAlertRepo;
    walasApiClient;
    logger = new common_1.Logger(AttendanceService_1.name);
    constructor(attendanceRecordRepo, attendanceSummaryRepo, attendanceAlertRepo, walasApiClient) {
        this.attendanceRecordRepo = attendanceRecordRepo;
        this.attendanceSummaryRepo = attendanceSummaryRepo;
        this.attendanceAlertRepo = attendanceAlertRepo;
        this.walasApiClient = walasApiClient;
    }
    async syncAttendanceFromWalas(startDate, endDate, forceSync = false) {
        try {
            this.logger.log(`Syncing attendance from ${startDate} to ${endDate}`);
            const walasData = await this.walasApiClient.getAttendanceRecords({
                start_date: this.formatDate(startDate),
                end_date: this.formatDate(endDate),
                limit: 1000,
            });
            if (!walasData.success || !walasData.data) {
                throw new Error('Failed to fetch from Walas API');
            }
            let syncedCount = 0;
            let failedCount = 0;
            const errors = [];
            for (const record of walasData.data) {
                try {
                    const existing = await this.attendanceRecordRepo.findOne({
                        where: {
                            student_id: record.student_id,
                            tanggal: record.tanggal,
                        },
                    });
                    if (existing && !forceSync) {
                        continue;
                    }
                    const mappedRecord = {
                        student_id: record.student_id,
                        student_name: record.student_name,
                        class_id: record.class_id,
                        tanggal: new Date(record.tanggal),
                        status: record.status,
                        notes: record.notes,
                        synced_from_walas: true,
                        synced_at: new Date(),
                    };
                    if (existing) {
                        Object.assign(existing, mappedRecord);
                        await this.attendanceRecordRepo.save(existing);
                    }
                    else {
                        const newRecord = this.attendanceRecordRepo.create(mappedRecord);
                        await this.attendanceRecordRepo.save(newRecord);
                    }
                    syncedCount++;
                }
                catch (error) {
                    failedCount++;
                    errors.push({
                        record_id: record.id,
                        error: error.message,
                    });
                    this.logger.error(`Failed to sync record ${record.id}: ${error.message}`);
                }
            }
            this.logger.log(`Sync completed: ${syncedCount} synced, ${failedCount} failed`);
            return {
                success: true,
                synced_records: syncedCount,
                failed: failedCount,
                errors: errors,
            };
        }
        catch (error) {
            this.logger.error(`Sync failed: ${error.message}`);
            return {
                success: false,
                synced_records: 0,
                failed: 0,
                errors: [{ error: error.message }],
            };
        }
    }
    async getAttendanceRecords(filters) {
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const skip = (page - 1) * limit;
        let query = this.attendanceRecordRepo.createQueryBuilder('a');
        if (filters.student_id) {
            query = query.where('a.student_id = :student_id', {
                student_id: filters.student_id,
            });
        }
        if (filters.class_id) {
            query = query.andWhere('a.class_id = :class_id', {
                class_id: filters.class_id,
            });
        }
        if (filters.start_date && filters.end_date) {
            query = query.andWhere('a.tanggal BETWEEN :start AND :end', {
                start: filters.start_date,
                end: filters.end_date,
            });
        }
        const total = await query.getCount();
        const records = await query
            .orderBy('a.tanggal', 'DESC')
            .skip(skip)
            .take(limit)
            .getMany();
        return {
            data: records,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    async getAttendanceSummary(studentId, month) {
        const [year, monthNum] = month.split('-').map(Number);
        let summary = await this.attendanceSummaryRepo.findOne({
            where: {
                student_id: studentId,
                tahun_bulan: month,
            },
        });
        if (summary) {
            return summary;
        }
        const records = await this.attendanceRecordRepo.find({
            where: {
                student_id: studentId,
                tanggal: (0, typeorm_2.Between)(new Date(year, monthNum - 1, 1), new Date(year, monthNum, 0)),
            },
        });
        const hadir = records.filter((r) => r.status === 'H').length;
        const sakit = records.filter((r) => r.status === 'S').length;
        const izin = records.filter((r) => r.status === 'I').length;
        const alpa = records.filter((r) => r.status === 'A').length;
        const totalDays = records.length;
        const percentage = totalDays > 0 ? (hadir / totalDays) * 100 : 0;
        const isFlagged = alpa > 5 || percentage < 75;
        const newSummary = this.attendanceSummaryRepo.create({
            student_id: studentId,
            class_id: 0,
            tahun_bulan: month,
            total_hadir: hadir,
            total_sakit: sakit,
            total_izin: izin,
            total_alpa: alpa,
            total_days_expected: 20,
            attendance_percentage: percentage,
            is_flagged: isFlagged,
            reason_if_flagged: isFlagged
                ? alpa > 5
                    ? `Alpa > 5 hari (${alpa} hari)`
                    : `Attendance < 75% (${percentage}%)`
                : undefined,
        });
        return await this.attendanceSummaryRepo.save(newSummary);
    }
    async generateAttendanceAlerts() {
        try {
            this.logger.log('Generating attendance alerts...');
            const month = new Date().toISOString().slice(0, 7);
            const allStudents = await this.getAllStudents();
            for (const student of allStudents) {
                if (!student || !student.id)
                    continue;
                const summary = await this.getAttendanceSummary(student.id, month);
                if (summary && summary.is_flagged) {
                    const existing = await this.attendanceAlertRepo.findOne({
                        where: {
                            student_id: student.id,
                            is_resolved: false,
                        },
                    });
                    if (!existing) {
                        const alert = this.attendanceAlertRepo.create({
                            student_id: student.id,
                            alert_type: summary.total_alpa > 5 ? 'high_alpa' : 'low_attendance',
                            description: summary.reason_if_flagged,
                            severity: summary.total_alpa > 5 ? 'critical' : 'warning',
                            is_resolved: false,
                        });
                        await this.attendanceAlertRepo.save(alert);
                        this.logger.log(`Alert created for student ${student.id}`);
                    }
                }
            }
            this.logger.log('Alert generation completed');
        }
        catch (error) {
            this.logger.error(`Alert generation failed: ${error.message}`);
        }
    }
    async exportAttendance(studentId, month, format) {
        const summary = await this.getAttendanceSummary(studentId, month);
        const records = await this.attendanceRecordRepo.find({
            where: {
                student_id: studentId,
                tanggal: (0, typeorm_2.Between)(new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]) - 1, 1), new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]), 0)),
            },
            order: { tanggal: 'ASC' },
        });
        if (format === 'pdf') {
            return this.generatePdfReport(summary, records);
        }
        else {
            return this.generateExcelReport(summary, records);
        }
    }
    formatDate(date) {
        return date.toISOString().split('T')[0];
    }
    async getAllStudents() {
        try {
            return [];
        }
        catch (error) {
            this.logger.error(`Failed to get all students: ${error.message}`);
            return [];
        }
    }
    generatePdfReport(summary, records) {
        return Buffer.from('');
    }
    generateExcelReport(summary, records) {
        return Buffer.from('');
    }
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = AttendanceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(attendance_record_entity_1.AttendanceRecord)),
    __param(1, (0, typeorm_1.InjectRepository)(attendance_summary_entity_1.AttendanceSummary)),
    __param(2, (0, typeorm_1.InjectRepository)(attendance_alert_entity_1.AttendanceAlert)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        walas_api_client_1.WalasApiClient])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map