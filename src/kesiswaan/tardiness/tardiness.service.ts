import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import {
  TardinessRecord,
  TardinessAppeal,
  TardinessSummary,
  TardinessAlert,
  TardinessPattern,
} from './entities/tardiness.entity';

interface SubmitTardinessDto {
  student_id: number;
  student_name: string;
  class_id: number;
  tanggal: string; // YYYY-MM-DD
  keterlambatan_menit: number;
  alasan?: string;
  bukti_foto?: string;
  created_by: string;
}

interface AppealTardinessDto {
  tardiness_record_id: string;
  alasan_appeal: string;
  bukti_appeal?: string;
}

interface VerifyTardinessDto {
  tardiness_record_id: string;
  status: 'verified' | 'rejected';
  catatan_petugas?: string;
  verified_by: string;
}

interface ReviewAppealDto {
  appeal_id: string;
  status: 'accepted' | 'rejected';
  catatan_bk?: string;
  resolved_by: string;
}

export interface SyncResult {
  submitted: number;
  verified: number;
  failed: number;
  errors: string[];
}

@Injectable()
export class TardinessService {
  private readonly logger = new Logger(TardinessService.name);

  constructor(
    @InjectRepository(TardinessRecord)
    private recordRepo: Repository<TardinessRecord>,

    @InjectRepository(TardinessAppeal)
    private appealRepo: Repository<TardinessAppeal>,

    @InjectRepository(TardinessSummary)
    private summaryRepo: Repository<TardinessSummary>,

    @InjectRepository(TardinessAlert)
    private alertRepo: Repository<TardinessAlert>,

    @InjectRepository(TardinessPattern)
    private patternRepo: Repository<TardinessPattern>,
  ) {}

  /**
   * Submit new tardiness record (from student or staff input)
   */
  async submitTardiness(dto: SubmitTardinessDto): Promise<TardinessRecord> {
    try {
      // Check if record already exists for this student on this date
      const existing = await this.recordRepo.findOne({
        where: {
          student_id: dto.student_id,
          tanggal: dto.tanggal,
        },
      });

      if (existing) {
        throw new Error(
          `Tardiness record already exists for student ${dto.student_id} on ${dto.tanggal}`,
        );
      }

      const record = this.recordRepo.create({
        ...dto,
        status: 'submitted',
        has_appeal: false,
      });

      const saved = await this.recordRepo.save(record);

      // Update monthly summary
      await this.updateMonthlySummary(dto.student_id, dto.class_id, dto.tanggal);

      return saved;
    } catch (error) {
      this.logger.error(`Failed to submit tardiness: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get tardiness records with filters and pagination
   */
  async getTardinessRecords(filters: {
    student_id?: number;
    class_id?: number;
    status?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: TardinessRecord[]; total: number; page: number; limit: number }> {
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
    } catch (error) {
      this.logger.error(`Failed to get tardiness records: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get tardiness summary for specific student and month
   */
  async getTardinessSummary(
    student_id: number,
    tahun_bulan?: string,
  ): Promise<TardinessSummary | Partial<TardinessSummary> | null> {
    try {
      const month = tahun_bulan || this.getCurrentYearMonth();

      let summary: TardinessSummary | Partial<TardinessSummary> | null = await this.summaryRepo.findOne({
        where: {
          student_id,
          tahun_bulan: month,
        },
      });

      // If not found, calculate on-the-fly
      if (!summary) {
        const [year, monthNum] = month.split('-');
        const startDate = `${year}-${monthNum}-01`;
        const endDate = new Date(parseInt(year), parseInt(monthNum), 0).toISOString().split('T')[0];

        const records = await this.recordRepo.find({
          where: {
            student_id,
            tanggal: Between(startDate, endDate),
          },
        });

        summary = this.calculateSummary(student_id, records, month);
      }

      return summary;
    } catch (error) {
      this.logger.error(`Failed to get tardiness summary: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get last N months of tardiness summary
   */
  async getTardinessHistory(
    student_id: number,
    months: number = 6,
  ): Promise<(TardinessSummary | Partial<TardinessSummary>)[]> {
    try {
      const summaries: (TardinessSummary | Partial<TardinessSummary>)[] = [];

      for (let i = months - 1; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const tahun_bulan = date.toISOString().slice(0, 7); // YYYY-MM format

        const summary = await this.getTardinessSummary(student_id, tahun_bulan);
        if (summary) {
          summaries.push(summary);
        }
      }

      return summaries;
    } catch (error) {
      this.logger.error(`Failed to get tardiness history: ${error.message}`);
      throw error;
    }
  }

  /**
   * Student appeals a tardiness record
   */
  async appealTardiness(dto: AppealTardinessDto): Promise<TardinessAppeal> {
    try {
      // Verify record exists
      const record = await this.recordRepo.findOne({
        where: { id: dto.tardiness_record_id },
      });

      if (!record) {
        throw new Error('Tardiness record not found');
      }

      // Create appeal
      const appeal = this.appealRepo.create({
        tardiness_record_id: dto.tardiness_record_id,
        student_id: record.student_id,
        alasan_appeal: dto.alasan_appeal,
        bukti_appeal: dto.bukti_appeal,
        status: 'pending',
        is_resolved: false,
      });

      const saved = await this.appealRepo.save(appeal);

      // Mark record as having appeal
      await this.recordRepo.update(
        { id: dto.tardiness_record_id },
        { has_appeal: true },
      );

      return saved;
    } catch (error) {
      this.logger.error(`Failed to appeal tardiness: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all appeals for student
   */
  async getStudentAppeals(student_id: number, filters?: {
    status?: string;
    is_resolved?: boolean;
  }): Promise<TardinessAppeal[]> {
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
    } catch (error) {
      this.logger.error(`Failed to get student appeals: ${error.message}`);
      throw error;
    }
  }

  /**
   * Review and respond to appeal (BK staff action)
   */
  async reviewAppeal(dto: ReviewAppealDto): Promise<TardinessAppeal | null> {
    try {
      const appeal = await this.appealRepo.findOne({
        where: { id: dto.appeal_id },
      });

      if (!appeal) {
        throw new Error('Appeal not found');
      }

      await this.appealRepo.update(
        { id: dto.appeal_id },
        {
          status: dto.status,
          catatan_bk: dto.catatan_bk,
          is_resolved: true,
          resolved_by: dto.resolved_by,
          resolved_at: new Date(),
        },
      );

      // If appeal accepted, mark original record as resolved
      if (dto.status === 'accepted') {
        await this.recordRepo.update(
          { id: appeal.tardiness_record_id },
          { status: 'resolved' },
        );
      }

      // Recalculate month summary
      const record = await this.recordRepo.findOne({
        where: { id: appeal.tardiness_record_id },
      });
      if (record) {
        await this.updateMonthlySummary(
          record.student_id,
          record.class_id,
          record.tanggal,
        );
      }

      return this.appealRepo.findOne({ where: { id: dto.appeal_id } });
    } catch (error) {
      this.logger.error(`Failed to review appeal: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate alerts for high tardiness (scheduled job)
   */
  async generateTardinessAlerts(): Promise<SyncResult> {
    try {
      const result: SyncResult = {
        submitted: 0,
        verified: 0,
        failed: 0,
        errors: [],
      };

      const currentMonth = this.getCurrentYearMonth();

      // Get all students with flagged tardiness in current month
      const flaggedSummaries = await this.summaryRepo.find({
        where: {
          tahun_bulan: currentMonth,
          is_flagged: true,
        },
      });

      for (const summary of flaggedSummaries) {
        try {
          // Check if alert already exists for this student this month
          const existingAlert = await this.alertRepo.findOne({
            where: {
              student_id: summary.student_id,
              alert_type: 'high_tardiness',
            },
          });

          if (!existingAlert) {
            const alert = this.alertRepo.create({
              student_id: summary.student_id,
              student_name: '', // Will be populated from student data
              alert_type: 'high_tardiness',
              description: `Student has ${summary.count_total} tardiness incidents in ${currentMonth}`,
              severity: summary.count_total >= 5 ? 'critical' : 'warning',
              alert_data: {
                month: currentMonth,
                count_total: summary.count_total,
                total_menit: summary.total_menit,
              },
              is_resolved: false,
            });

            await this.alertRepo.save(alert);
            result.submitted++;
          }
        } catch (error) {
          result.failed++;
          result.errors.push(`Failed to create alert for student ${summary.student_id}: ${error.message}`);
        }
      }

      return result;
    } catch (error) {
      this.logger.error(`Failed to generate alerts: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get unresolved alerts
   */
  async getUnresolvedAlerts(filters?: {
    student_id?: number;
    severity?: string;
  }): Promise<TardinessAlert[]> {
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
    } catch (error) {
      this.logger.error(`Failed to get unresolved alerts: ${error.message}`);
      throw error;
    }
  }

  /**
   * Resolve alert (mark as handled by counselor)
   */
  async resolveAlert(alert_id: string, resolved_by: string): Promise<TardinessAlert | null> {
    try {
      await this.alertRepo.update(
        { id: alert_id },
        {
          is_resolved: true,
          resolved_by,
          resolved_at: new Date(),
        },
      );

      return this.alertRepo.findOne({ where: { id: alert_id } });
    } catch (error) {
      this.logger.error(`Failed to resolve alert: ${error.message}`);
      throw error;
    }
  }

  /**
   * Detect patterns in student tardiness
   */
  async detectPatterns(student_id: number): Promise<TardinessPattern[]> {
    try {
      const patterns: TardinessPattern[] = [];

      // Get last 3 months of records
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const records = await this.recordRepo.find({
        where: {
          student_id,
          tanggal: Between(
            threeMonthsAgo.toISOString().split('T')[0],
            new Date().toISOString().split('T')[0],
          ),
        },
      });

      if (records.length === 0) {
        return patterns;
      }

      // Detect day-of-week pattern
      const dayOfWeekCounts: Record<number, number> = {};
      records.forEach((record) => {
        const day = new Date(record.tanggal).getDay();
        dayOfWeekCounts[day] = (dayOfWeekCounts[day] || 0) + 1;
      });

      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      for (const [day, count] of Object.entries(dayOfWeekCounts)) {
        if (count >= 2) {
          // At least 2 instances
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

      // Detect if tardiness minutes are always in similar range
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

      // Save detected patterns
      for (const pattern of patterns) {
        // Remove existing pattern of same type
        await this.patternRepo.delete({
          student_id,
          pattern_type: pattern.pattern_type,
        });

        // Save new pattern
        await this.patternRepo.save(pattern);
      }

      return patterns;
    } catch (error) {
      this.logger.error(`Failed to detect patterns: ${error.message}`);
      throw error;
    }
  }

  /**
   * Export tardiness report
   */
  async exportReport(student_id: number, month: string): Promise<any> {
    try {
      const summary = await this.getTardinessSummary(student_id, month);
      const records = await this.recordRepo.find({
        where: {
          student_id,
          tanggal: Between(
            `${month}-01`,
            `${month}-31`,
          ),
        },
      });

      return {
        summary,
        records,
        generatedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to export report: ${error.message}`);
      throw error;
    }
  }

  /**
   * ============ PRIVATE HELPER METHODS ============
   */

  private getCurrentYearMonth(): string {
    const now = new Date();
    return now.toISOString().slice(0, 7); // YYYY-MM
  }

  private async updateMonthlySummary(
    student_id: number,
    class_id: number,
    tanggal: string,
  ): Promise<void> {
    try {
      const [year, month] = tanggal.split('-');
      const tahun_bulan = `${year}-${month}`;

      // Get all records for this month
      const startDate = `${year}-${month}-01`;
      const endDate = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0];

      const records = await this.recordRepo.find({
        where: {
          student_id,
          tanggal: Between(startDate, endDate),
        },
      });

      const summary = this.calculateSummary(student_id, records, tahun_bulan);

      // Upsert summary
      const existing = await this.summaryRepo.findOne({
        where: { student_id, tahun_bulan },
      });

      if (existing) {
        await this.summaryRepo.update(
          { student_id, tahun_bulan },
          summary,
        );
      } else {
        const newSummary = this.summaryRepo.create({
          student_id,
          class_id,
          ...summary,
        });
        await this.summaryRepo.save(newSummary);
      }
    } catch (error) {
      this.logger.error(`Failed to update summary: ${error.message}`);
    }
  }

  private calculateSummary(
    student_id: number,
    records: TardinessRecord[],
    tahun_bulan: string,
  ): Partial<TardinessSummary> {
    const count_total = records.length;
    const count_verified = records.filter((r) => r.status === 'verified').length;
    const count_disputed = records.filter((r) => r.has_appeal).length;
    const total_menit = records.reduce((sum, r) => sum + r.keterlambatan_menit, 0);

    // Determine threshold status
    let threshold_status = 'ok';
    if (count_total >= 5) {
      threshold_status = 'critical';
    } else if (count_total >= 3) {
      threshold_status = 'warning';
    }

    // Flag if critical
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
}
