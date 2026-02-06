import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BimbinganReferral } from './entities/bimbingan-referral.entity';
import { BimbinganService } from './bimbingan.service';

/**
 * Auto-Referral Integration Service
 * Handles automatic referral triggering from Fitur 1-3 (Attendance, Tardiness, Violations)
 *
 * Integration Points:
 * - Fitur 3 (Violations): SP2 or SP3 issued → automatic referral
 * - Fitur 2 (Tardiness): 5+ tardiness + rejected appeals → automatic referral
 * - Fitur 1 (Attendance): Absence rate < 75% (chronic absence) → automatic referral
 */
@Injectable()
export class AutoReferralService {
  private readonly logger = new Logger(AutoReferralService.name);

  constructor(
    @InjectRepository(BimbinganReferral)
    private readonly referralRepository: Repository<BimbinganReferral>,
    private readonly bimbinganService: BimbinganService,
  ) {}

  /**
   * Handle violation escalation (SP2 or SP3)
   * Triggered when a student receives an SP2 or SP3 (from violations.service)
   *
   * @param studentId Student ID
   * @param studentName Student name
   * @param spLevel SP level (SP1, SP2, or SP3)
   * @param violationCount Total violations count
   * @param violationDetails Array of violations
   * @param tahun Academic year
   */
  async handleViolationReferral(
    studentId: number,
    studentName: string,
    spLevel: string,
    violationCount: number,
    violationDetails: any[],
    tahun: number,
  ): Promise<BimbinganReferral> {
    try {
      // Check if referral already exists for this student this year
      const existingReferral = await this.referralRepository.findOne({
        where: {
          student_id: studentId,
          tahun,
          referral_reason: 'SP escalation',
        },
      });

      if (existingReferral) {
        this.logger.warn(
          `Referral already exists for student ${studentId}, violation escalation skipped`,
        );
        return existingReferral;
      }

      // Determine risk level based on SP level
      const riskLevel = spLevel === 'SP3' ? 'red' : spLevel === 'SP2' ? 'orange' : 'yellow';

      // Create referral
      const referralDto = {
        student_id: studentId,
        student_name: studentName,
        class_id: 0, // Will be populated from student service
        tahun,
        referral_reason: `Student issued ${spLevel} due to repeated violations (Total: ${violationCount})`,
        risk_level: riskLevel,
        is_urgent: spLevel === 'SP3',
        referral_source: {
          source: 'violations_escalation',
          source_id: null,
          sp_level: spLevel,
          violation_count: violationCount,
          details: violationDetails,
        },
        notes: `Auto-generated referral from SP ${spLevel} escalation. Student has ${violationCount} total violations.`,
      };

      const referral = await this.bimbinganService.createReferral(referralDto);

      this.logger.log(
        `Violation referral created for student ${studentId} (${spLevel}) with risk level ${riskLevel}`,
      );

      return referral;
    } catch (error) {
      this.logger.error(
        `Failed to create violation referral for student ${studentId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Handle tardiness escalation
   * Triggered when a student has 5+ tardiness records with rejected appeals
   *
   * @param studentId Student ID
   * @param studentName Student name
   * @param tardinessCount Total tardiness count
   * @param appealStatus Status of appeals (rejected count)
   * @param tahun Academic year
   */
  async handleTardinessReferral(
    studentId: number,
    studentName: string,
    tardinessCount: number,
    rejectedAppealCount: number,
    tahun: number,
  ): Promise<BimbinganReferral> {
    try {
      // Check if referral already exists
      const existingReferral = await this.referralRepository.findOne({
        where: {
          student_id: studentId,
          tahun,
          referral_reason: 'Chronic tardiness',
        },
      });

      if (existingReferral) {
        this.logger.warn(
          `Tardiness referral already exists for student ${studentId}, skipped`,
        );
        return existingReferral;
      }

      // Risk level based on tardiness count
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
          source_id: null,
          tardiness_count: tardinessCount,
          rejected_appeal_count: rejectedAppealCount,
        },
        notes: `Auto-generated from repeated tardiness. ${tardinessCount} total tardiness records with ${rejectedAppealCount} rejected appeals.`,
      };

      const referral = await this.bimbinganService.createReferral(referralDto);

      this.logger.log(
        `Tardiness referral created for student ${studentId} (${tardinessCount} times) with risk level ${riskLevel}`,
      );

      return referral;
    } catch (error) {
      this.logger.error(
        `Failed to create tardiness referral for student ${studentId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Handle chronic absence (attendance < 75%)
   * Triggered when attendance rate falls below 75%
   *
   * @param studentId Student ID
   * @param studentName Student name
   * @param attendanceRate Attendance rate (0-100)
   * @param totalAbsences Total absence days
   * @param totalDaysInSchool Total school days in period
   * @param tahun Academic year
   */
  async handleAttendanceReferral(
    studentId: number,
    studentName: string,
    attendanceRate: number,
    totalAbsences: number,
    totalDaysInSchool: number,
    tahun: number,
  ): Promise<BimbinganReferral> {
    try {
      // Check if referral exists
      const existingReferral = await this.referralRepository.findOne({
        where: {
          student_id: studentId,
          tahun,
          referral_reason: 'Chronic absence',
        },
      });

      if (existingReferral) {
        this.logger.warn(
          `Attendance referral already exists for student ${studentId}, skipped`,
        );
        return existingReferral;
      }

      // Risk level based on attendance rate
      let riskLevel = 'yellow';
      if (attendanceRate < 50) riskLevel = 'red';
      else if (attendanceRate < 60) riskLevel = 'orange';
      else if (attendanceRate < 75) riskLevel = 'yellow';

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
          source_id: null,
          attendance_rate: attendanceRate,
          total_absences: totalAbsences,
          total_days_in_school: totalDaysInSchool,
        },
        notes: `Auto-generated from chronic absence. Attendance rate ${attendanceRate.toFixed(2)}% with ${totalAbsences} absences out of ${totalDaysInSchool} school days.`,
      };

      const referral = await this.bimbinganService.createReferral(referralDto);

      this.logger.log(
        `Attendance referral created for student ${studentId} (${attendanceRate.toFixed(2)}% attendance) with risk level ${riskLevel}`,
      );

      return referral;
    } catch (error) {
      this.logger.error(
        `Failed to create attendance referral for student ${studentId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Handle academic underperformance
   * Triggered when GPA < 2.0 or multiple failing subjects
   *
   * @param studentId Student ID
   * @param studentName Student name
   * @param gpa Current GPA
   * @param failingSubjectsCount Number of failing subjects
   * @param tahun Academic year
   */
  async handleAcademicReferral(
    studentId: number,
    studentName: string,
    gpa: number,
    failingSubjectsCount: number,
    tahun: number,
  ): Promise<BimbinganReferral> {
    try {
      // Check if referral exists
      const existingReferral = await this.referralRepository.findOne({
        where: {
          student_id: studentId,
          tahun,
          referral_reason: 'Academic underperformance',
        },
      });

      if (existingReferral) {
        this.logger.warn(
          `Academic referral already exists for student ${studentId}, skipped`,
        );
        return existingReferral;
      }

      // Risk level based on GPA and failing subjects
      let riskLevel = 'yellow';
      if (gpa < 1.5 || failingSubjectsCount > 3) riskLevel = 'red';
      else if (gpa < 2.0 || failingSubjectsCount > 1) riskLevel = 'orange';

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
          source_id: null,
          gpa,
          failing_subjects_count: failingSubjectsCount,
        },
        notes: `Auto-generated from academic underperformance. GPA ${gpa.toFixed(2)} with ${failingSubjectsCount} failing subjects.`,
      };

      const referral = await this.bimbinganService.createReferral(referralDto);

      this.logger.log(
        `Academic referral created for student ${studentId} (GPA: ${gpa.toFixed(2)}) with risk level ${riskLevel}`,
      );

      return referral;
    } catch (error) {
      this.logger.error(
        `Failed to create academic referral for student ${studentId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Bulk check for students needing referral
   * Runs periodically to identify students based on aggregated statistics
   * Should be called via scheduled task (cron) once per week
   *
   * @param tahun Academic year
   */
  async periodicCheckAndReferral(tahun: number): Promise<any> {
    try {
      this.logger.log(`Starting periodic referral check for tahun ${tahun}`);

      // This would integrate with:
      // 1. attendance service to get students with < 75% attendance
      // 2. tardiness service to get students with 5+ tardiness
      // 3. violations service to get students with multiple violations
      // 4. academic service to get students with low GPA

      // Pseudocode - actual implementation depends on other services
      // const atRiskStudents = await this.findAtRiskStudents(tahun);
      // for (const student of atRiskStudents) {
      //   if (!student.hasGuidanceReferral) {
      //     await this.handleXyzReferral(student);
      //   }
      // }

      this.logger.log(`Periodic referral check completed for tahun ${tahun}`);

      return { message: 'Periodic check completed', timestamp: new Date() };
    } catch (error) {
      this.logger.error(`Periodic referral check failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get at-risk students summary
   * Returns students who might need referral or are already in guidance
   */
  async getAtRiskStudentsSummary(tahun: number) {
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
          violations: results.filter((r) => r.referral_source?.source === 'violations_escalation')
            .length,
          tardiness: results.filter((r) => r.referral_source?.source === 'tardiness_escalation')
            .length,
          attendance: results.filter((r) => r.referral_source?.source === 'attendance_escalation')
            .length,
          academic: results.filter(
            (r) => r.referral_source?.source === 'academic_underperformance',
          ).length,
        },
        students: results.map((r) => ({
          id: r.id,
          student_id: r.student_id,
          student_name: r.student_name,
          risk_level: r.risk_level,
          source: r.referral_source?.source,
          status: r.status,
          referral_date: r.referral_date,
          assigned_to: r.counselor_name || 'Unassigned',
        })),
      };
    } catch (error) {
      this.logger.error(`Failed to get at-risk students summary: ${error.message}`);
      throw error;
    }
  }

  /**
   * Deactivate referral when condition improves
   * Called from other modules when student no longer meets escalation criteria
   * e.g., when attendance improves to > 85%
   */
  async deactivateReferral(
    studentId: number,
    tahun: number,
    reason: string,
  ): Promise<BimbinganReferral> {
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
    } catch (error) {
      this.logger.error(
        `Failed to deactivate referral for student ${studentId}: ${error.message}`,
      );
      throw error;
    }
  }
}
