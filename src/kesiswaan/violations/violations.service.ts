import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, IsNull } from 'typeorm';
import { WalasApiClient } from '../../walas/walas-api.client';
import {
  Violation,
  ViolationCategory,
  SpLetter,
  SpProgression,
  ViolationExcuse,
  ViolationStatistics,
} from './entities/violation.entity';
import { SpPdfService } from './sp-pdf.service';

interface ReportViolationDto {
  student_id: number;
  student_name: string;
  class_id: number;
  violation_category_id: string;
  description: string;
  tanggal_pelanggaran: string; // YYYY-MM-DD
  bukti_foto?: string;
  catatan_petugas?: string;
  severity?: number;
  created_by: string;
}

interface SubmitExcuseDto {
  violation_id: string;
  excuse_text: string;
  bukti_excuse?: string;
}

interface ReviewExcuseDto {
  excuse_id: string;
  status: 'accepted' | 'rejected';
  catatan_bk?: string;
  resolved_by: string;
}

@Injectable()
export class ViolationService {
  private readonly logger = new Logger(ViolationService.name);

  // SP Generation Rules
  private readonly SP_RULES = {
    SP1: { violations_count: 3, sp_level: 1, consequences: 'Peringatan lisan dan tertulis' },
    SP2: { violations_count: 5, sp_level: 2, consequences: 'Peringatan tertulis dan pembatasan kegiatan' },
    SP3: { violations_count: 7, sp_level: 3, consequences: 'Peringatan akhir atau dirujuk untuk dibimbing intensif' },
    EXPULSION: { violations_count: 9, sp_level: 4, consequences: 'Dikeluarkan dari sekolah' },
  };

  constructor(
    @InjectRepository(Violation)
    private violationRepo: Repository<Violation>,

    @InjectRepository(ViolationCategory)
    private categoryRepo: Repository<ViolationCategory>,

    @InjectRepository(SpLetter)
    private spLetterRepo: Repository<SpLetter>,

    @InjectRepository(SpProgression)
    private progressionRepo: Repository<SpProgression>,

    @InjectRepository(ViolationExcuse)
    private excuseRepo: Repository<ViolationExcuse>,

    @InjectRepository(ViolationStatistics)
    private statsRepo: Repository<ViolationStatistics>,

    private readonly spPdfService: SpPdfService,
    private walasApiClient: WalasApiClient,
  ) {}

  /**
   * Report new violation (by teacher/staff)
   */
  async reportViolation(dto: ReportViolationDto): Promise<Violation> {
    try {
      const violation = this.violationRepo.create({
        ...dto,
        severity: dto.severity || 1,
        is_processed: false,
      });

      const saved = await this.violationRepo.save(violation);

      // Update statistics
      await this.updateStatistics(dto.student_id);

      // Check if auto-trigger SP needed
      await this.checkAndGenerateSp(dto.student_id);

      return saved;
    } catch (error) {
      this.logger.error(`Failed to report violation: ${error.message}`);
      throw error;
    }
  }

  /**
   * Sync violations dari Walas (jika ada integrasi)
   * Auto-trigger referral ke bimbingan jika perlu
   * 
   * NOTE: Violations adalah data internal RuangSiswa (tidak dari Walas).
   * Method ini tetap disediakan untuk kompatibilitas, tapi hanya mengembalikan
   * data violations yang sudah ada di database.
   */
  async syncViolationsFromWalas(
    startDate: Date,
    endDate: Date,
    forceSync: boolean = false,
  ): Promise<{
    success: boolean;
    synced_violations: number;
    failed: number;
    errors: any[];
  }> {
    try {
      this.logger.log(`Retrieving violations (${this.formatDate(startDate)} to ${this.formatDate(endDate)})`);

      // Violations adalah data internal RuangSiswa, bukan dari Walas
      // Tandai sebagai synced untuk tracking purposes
      const violationsData = await this.violationRepo.find({
        where: {
          tanggal_pelanggaran: this.formatDate(startDate),
        },
        relations: ['student'],
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
      const errors: any[] = [];

      // Process setiap violation record yang belum diproses
      for (const violation of violationsData) {
        try {
          // Update statistics dan check SP untuk setiap student dengan violation
          await this.updateStatistics(violation.student_id);
          
          // Check dan generate SP letter jika diperlukan
          const spLetter = await this.checkAndGenerateSp(violation.student_id);
          if (spLetter) {
            this.logger.log(`SP letter generated for student ${violation.student_id}`);
          }

          syncedCount++;
        } catch (error) {
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
    } catch (error) {
      this.logger.error(`Violations sync failed: ${error.message}`);
      return {
        success: false,
        synced_violations: 0,
        failed: 0,
        errors: [{ error: error.message }],
      };
    }
  }

  /**
   * Get all violations for student with filters
   */
  async getViolations(filters: {
    student_id?: number;
    class_id?: number;
    category_id?: string;
    processed?: boolean;
    date_from?: string;
    date_to?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Violation[]; total: number; page: number; limit: number }> {
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
    } catch (error) {
      this.logger.error(`Failed to get violations: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get unprocessed violations for student (violations not yet in SP)
   */
  async getUnprocessedViolations(student_id: number): Promise<Violation[]> {
    try {
      return this.violationRepo.find({
        where: {
          student_id,
          is_processed: false,
        },
        order: { tanggal_pelanggaran: 'DESC' },
      });
    } catch (error) {
      this.logger.error(`Failed to get unprocessed violations: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get SP progression for student in current year
   */
  async getSpProgression(student_id: number, tahun?: number): Promise<SpProgression | null> {
    try {
      const year = tahun || new Date().getFullYear();

      let progression = await this.progressionRepo.findOne({
        where: { student_id, tahun: year },
      });

      // If not found, create initial record
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
    } catch (error) {
      this.logger.error(`Failed to get SP progression: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all SP letters for student
   */
  async getSpLetters(filters: {
    student_id?: number;
    sp_level?: number;
    tahun?: number;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: SpLetter[]; total: number; page: number; limit: number }> {
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
    } catch (error) {
      this.logger.error(`Failed to get SP letters: ${error.message}`);
      throw error;
    }
  }

  /**
   * Auto-generate SP when violations reach threshold
   * This is the CORE logic for SP auto-generation
   */
  async checkAndGenerateSp(student_id: number): Promise<SpLetter | null> {
    try {
      const tahun = new Date().getFullYear();

      // Get student's progression
      let progression = await this.getSpProgression(student_id, tahun);
      
      // If no progression exists, create a new one
      if (!progression) {
        progression = this.progressionRepo.create({ student_id, tahun, current_sp_level: 0 });
      }

      // Count unprocessed violations
      const unprocessedViolations = await this.getUnprocessedViolations(student_id);
      const totalViolations = await this.violationRepo.count({
        where: { student_id },
      });

      progression.violation_count = totalViolations;

      // Check SP trigger thresholds
      let shouldGenerateSp = false;
      let nextSpLevel = progression.current_sp_level + 1;

      // Determine which SP to generate based on accumulated violations
      if (totalViolations >= 3 && progression.current_sp_level === 0) {
        shouldGenerateSp = true;
        nextSpLevel = 1;
      } else if (totalViolations >= 5 && progression.current_sp_level < 2) {
        shouldGenerateSp = true;
        nextSpLevel = 2;
      } else if (totalViolations >= 7 && progression.current_sp_level < 3) {
        shouldGenerateSp = true;
        nextSpLevel = 3;
      } else if (totalViolations >= 9 && progression.current_sp_level === 3) {
        // Trigger expulsion after SP3
        shouldGenerateSp = true;
        nextSpLevel = 4; // This means expulsion
      }

      if (!shouldGenerateSp || unprocessedViolations.length === 0) {
        return null;
      }

      // Generate SP letter
      const spLetter = await this.generateSpLetter(student_id, nextSpLevel, unprocessedViolations);

      // Update progression
      progression.current_sp_level = nextSpLevel === 4 ? 3 : nextSpLevel;
      if (nextSpLevel === 1) progression.sp1_issued_count++;
      if (nextSpLevel === 2) progression.sp2_issued_count++;
      if (nextSpLevel === 3) progression.sp3_issued_count++;

      progression.last_sp_date = new Date().toISOString().split('T')[0];
      if (!progression.first_sp_date) {
        progression.first_sp_date = progression.last_sp_date;
      }

      // If expulsion, mark it
      if (nextSpLevel === 4) {
        progression.is_expelled = true;
        progression.expulsion_date = new Date().toISOString().split('T')[0];
        progression.reason_if_expelled = 'SP3_escalation';
      }

      await this.progressionRepo.save(progression);

      return spLetter;
    } catch (error) {
      this.logger.error(`Failed to check and generate SP: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate actual SP letter document
   */
  private async generateSpLetter(
    student_id: number,
    spLevel: number,
    violations: Violation[],
  ): Promise<SpLetter> {
    try {
      // Get student info from violations
      const studentInfo = violations[0];

      // Generate SP number: SP/YYYY/###/TYPE
      const tahun = new Date().getFullYear();
      const spCount = await this.spLetterRepo.count({
        where: { tahun },
      });
      const spNumber = `SP/${tahun}/${String(spCount + 1).padStart(3, '0')}/PEL`;

      // Get consequences based on level
      const consequencesMap = {
        1: 'Peringatan lisan dan tertulis kepada siswa. Orang tua diminta hadir untuk penandatanganan surat perjanjian.',
        2: 'Pembatasan kegiatan (tidak boleh ikut ekstrakurikuler, pameran, acara sekolah). Orang tua diminta hadir untuk penandatanganan surat perjanjian yang lebih keras.',
        3: 'Rujukan ke bimbingan konseling intensif atau pemulangan dari sekolah jika tidak ada perbaikan. Orang tua dan siswa diminta hadir untuk diskusi lanjutan.',
        4: 'Dikeluarkan dari sekolah berdasarkan keputusan rapat dewan guru.',
      };

      // Build violations text
      const violationsText = violations
        .map(
          (v) =>
            `${v.tanggal_pelanggaran}: ${v.description}`,
        )
        .join('; ');

      const spLetter = this.spLetterRepo.create({
        student_id,
        student_name: studentInfo.student_name,
        class_id: studentInfo.class_id,
        nis: '', // Will be set when fetching student data
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
        material_cost: 10000, // Biaya kertas/print
      });

      const saved = await this.spLetterRepo.save(spLetter);

      // Mark violations as processed
      await this.violationRepo.update(
        { id: violations[0].id },
        { is_processed: true, sp_letter_id: saved.id },
      );

      return saved;
    } catch (error) {
      this.logger.error(`Failed to generate SP letter: ${error.message}`);
      throw error;
    }
  }

  /**
   * Sign SP letter (parent/guardian signature)
   */
  async signSpLetter(
    sp_letter_id: string,
    signed_by_parent: string,
  ): Promise<SpLetter | null> {
    try {
      await this.spLetterRepo.update(
        { id: sp_letter_id },
        {
          is_signed: true,
          signed_date: new Date().toISOString().split('T')[0],
          signed_by_parent,
          status: 'signed',
        },
      );

      return this.spLetterRepo.findOne({
        where: { id: sp_letter_id },
      });
    } catch (error) {
      this.logger.error(`Failed to sign SP letter: ${error.message}`);
      throw error;
    }
  }

  /**
   * Submit excuse for violation (student appeal)
   */
  async submitExcuse(dto: SubmitExcuseDto): Promise<ViolationExcuse> {
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
    } catch (error) {
      this.logger.error(`Failed to submit excuse: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get excuses for review (BK staff)
   */
  async getExcuses(filters: {
    student_id?: number;
    status?: string;
    is_resolved?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ data: ViolationExcuse[]; total: number; page: number; limit: number }> {
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
    } catch (error) {
      this.logger.error(`Failed to get excuses: ${error.message}`);
      throw error;
    }
  }

  /**
   * Review excuse and decide (BK staff action)
   */
  async reviewExcuse(dto: ReviewExcuseDto): Promise<ViolationExcuse | null> {
    try {
      const excuse = await this.excuseRepo.findOne({
        where: { id: dto.excuse_id },
      });

      if (!excuse) {
        throw new Error('Excuse not found');
      }

      // Update excuse
      await this.excuseRepo.update(
        { id: dto.excuse_id },
        {
          status: dto.status,
          catatan_bk: dto.catatan_bk,
          is_resolved: true,
          resolved_by: dto.resolved_by,
          resolved_at: new Date(),
        },
      );

      // If accepted, mark violation as removed from consideration
      if (dto.status === 'accepted') {
        await this.violationRepo.update(
          { id: excuse.violation_id },
          { is_processed: true },
        );

        // Recalculate SP needed
        const violation = await this.violationRepo.findOne({
          where: { id: excuse.violation_id },
        });
        if (violation) {
          await this.updateStatistics(violation.student_id);
        }
      }

      return this.excuseRepo.findOne({ where: { id: dto.excuse_id } });
    } catch (error) {
      this.logger.error(`Failed to review excuse: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get student risk level based on violations
   */
  async getStudentRiskLevel(student_id: number, tahun?: number): Promise<{
    risk_level: string;
    violation_count: number;
    sp_level: number;
    is_expelled: boolean;
  }> {
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
      } else if (progression.violation_count >= 6) {
        riskLevel = 'orange';
      } else if (progression.violation_count >= 3) {
        riskLevel = 'yellow';
      }

      return {
        risk_level: riskLevel,
        violation_count: progression.violation_count,
        sp_level: progression.current_sp_level,
        is_expelled: progression.is_expelled,
      };
    } catch (error) {
      this.logger.error(`Failed to get risk level: ${error.message}`);
      throw error;
    }
  }

  /**
   * Export violation report
   */
  async exportReport(student_id: number, tahun?: number): Promise<any> {
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
    } catch (error) {
      this.logger.error(`Failed to export report: ${error.message}`);
      throw error;
    }
  }

  /**
   * ============ PRIVATE HELPER METHODS ============
   */

  private async updateStatistics(student_id: number, tahun?: number): Promise<void> {
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
      } else if (violations.length >= 6) {
        riskLevel = 'orange';
      } else if (violations.length >= 3) {
        riskLevel = 'yellow';
      }

      const existingStats = await this.statsRepo.findOne({
        where: { student_id, tahun: year },
      });

      if (existingStats) {
        await this.statsRepo.update(
          { student_id, tahun: year },
          {
            total_violations: violations.length,
            total_severity_score: totalSeverity,
            average_severity: avgSeverity,
            sp_count: spLetters,
            risk_level: riskLevel,
          },
        );
      } else {
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
    } catch (error) {
      this.logger.error(`Failed to update statistics: ${error.message}`);
    }
  }

  /**
   * Helper: Format date to YYYY-MM-DD
   */
  private formatDate(date: Date | string): string {
    if (typeof date === 'string') {
      return date.split('T')[0];
    }
    return date.toISOString().split('T')[0];
  }
}
