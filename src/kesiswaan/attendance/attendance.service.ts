import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { WalasApiClient } from '../../walas/walas-api.client';
import { AttendanceRecord } from '../entities/attendance-record.entity';
import { AttendanceSummary } from '../entities/attendance-summary.entity';
import { AttendanceAlert } from '../entities/attendance-alert.entity';

/**
 * AttendanceService
 * Service untuk mengelola fitur Kehadiran di RuangSiswa Kesiswaan
 * - Sync data dari Walas
 * - Hitung statistik kehadiran
 * - Generate alerts
 * - Export reports
 */
@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(
    @InjectRepository(AttendanceRecord)
    private attendanceRecordRepo: Repository<AttendanceRecord>,

    @InjectRepository(AttendanceSummary)
    private attendanceSummaryRepo: Repository<AttendanceSummary>,

    @InjectRepository(AttendanceAlert)
    private attendanceAlertRepo: Repository<AttendanceAlert>,

    private walasApiClient: WalasApiClient,
  ) {}

  /**
   * Sync attendance data dari Walas ke RuangSiswa
   * Method ini dipanggil secara berkala (scheduled job)
   */
  async syncAttendanceFromWalas(
    startDate: Date,
    endDate: Date,
    forceSync: boolean = false,
  ): Promise<SyncResult> {
    try {
      this.logger.log(`Syncing attendance from ${startDate} to ${endDate}`);

      // Fetch dari Walas API
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

      // Process setiap record
      for (const record of walasData.data) {
        try {
          // Check apakah sudah ada
          const existing = await this.attendanceRecordRepo.findOne({
            where: {
              student_id: record.student_id,
              tanggal: record.tanggal,
            },
          });

          if (existing && !forceSync) {
            continue; // Skip jika sudah ada
          }

          // Map dari Walas format
          const mappedRecord = {
            student_id: record.student_id,
            student_name: record.student_name,
            class_id: record.class_id,
            tanggal: new Date(record.tanggal),
            status: record.status, // H/S/I/A
            notes: record.notes,
            synced_from_walas: true,
            synced_at: new Date(),
          };

          // Save atau update
          if (existing) {
            Object.assign(existing, mappedRecord);
            await this.attendanceRecordRepo.save(existing);
          } else {
            const newRecord = this.attendanceRecordRepo.create(mappedRecord);
            await this.attendanceRecordRepo.save(newRecord);
          }

          syncedCount++;
        } catch (error) {
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
    } catch (error) {
      this.logger.error(`Sync failed: ${error.message}`);
      return {
        success: false,
        synced_records: 0,
        failed: 0,
        errors: [{ error: error.message }],
      };
    }
  }

  /**
   * Get attendance records dengan filter
   */
  async getAttendanceRecords(filters: {
    student_id?: number;
    class_id?: number;
    start_date?: Date;
    end_date?: Date;
    page?: number;
    limit?: number;
  }) {
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

  /**
   * Calculate monthly attendance summary
   */
  async getAttendanceSummary(studentId: number, month: string) {
    // Format: "2025-01"
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

    // Calculate from records
    const records = await this.attendanceRecordRepo.find({
      where: {
        student_id: studentId,
        tanggal: Between(
          new Date(year, monthNum - 1, 1),
          new Date(year, monthNum, 0),
        ),
      },
    });

    const hadir = records.filter((r) => r.status === 'H').length;
    const sakit = records.filter((r) => r.status === 'S').length;
    const izin = records.filter((r) => r.status === 'I').length;
    const alpa = records.filter((r) => r.status === 'A').length;
    const totalDays = records.length;
    const percentage = totalDays > 0 ? (hadir / totalDays) * 100 : 0;

    // Check if flagged
    const isFlagged = alpa > 5 || percentage < 75;

    const newSummary = this.attendanceSummaryRepo.create({
      student_id: studentId,
      tahun_bulan: month,
      total_hadir: hadir,
      total_sakit: sakit,
      total_izin: izin,
      total_alpa: alpa,
      total_days_expected: 20, // Assume 20 days per month
      attendance_percentage: percentage,
      is_flagged: isFlagged,
      reason_if_flagged: isFlagged
        ? alpa > 5
          ? `Alpa > 5 hari (${alpa} hari)`
          : `Attendance < 75% (${percentage}%)`
        : null,
    });

    return await this.attendanceSummaryRepo.save(newSummary);
  }

  /**
   * Generate attendance alerts
   * Dipanggil setiap hari (scheduled job)
   */
  async generateAttendanceAlerts(): Promise<void> {
    try {
      this.logger.log('Generating attendance alerts...');

      const month = new Date().toISOString().slice(0, 7); // "2025-01"
      const allStudents = await this.getAllStudents(); // Implementation depends on your setup

      for (const student of allStudents) {
        const summary = await this.getAttendanceSummary(student.id, month);

        if (summary.is_flagged) {
          // Check if alert already exists
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
    } catch (error) {
      this.logger.error(`Alert generation failed: ${error.message}`);
    }
  }

  /**
   * Export attendance to PDF or Excel
   */
  async exportAttendance(
    studentId: number,
    month: string,
    format: 'pdf' | 'excel',
  ): Promise<Buffer> {
    const summary = await this.getAttendanceSummary(studentId, month);
    const records = await this.attendanceRecordRepo.find({
      where: {
        student_id: studentId,
        tanggal: Between(
          new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]) - 1, 1),
          new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]), 0),
        ),
      },
      order: { tanggal: 'ASC' },
    });

    if (format === 'pdf') {
      return this.generatePdfReport(summary, records);
    } else {
      return this.generateExcelReport(summary, records);
    }
  }

  /**
   * Private helper functions
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private async getAllStudents() {
    // TODO: Implement this based on your database setup
    return [];
  }

  private generatePdfReport(summary: any, records: any[]): Buffer {
    // TODO: Implement PDF generation using a library like PDFKit
    return Buffer.from('');
  }

  private generateExcelReport(summary: any, records: any[]): Buffer {
    // TODO: Implement Excel generation using a library like ExcelJS
    return Buffer.from('');
  }
}

export interface SyncResult {
  success: boolean;
  synced_records: number;
  failed: number;
  errors: any[];
}
