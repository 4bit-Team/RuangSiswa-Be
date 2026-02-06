import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AutoReferralService } from '../bimbingan/auto-referral.service';

/**
 * Violations-to-Bimbingan Integration Service
 * Handles auto-referral triggering when students receive SP2 or SP3
 * 
 * This service acts as a bridge between Violations module and Bimbingan module
 */
@Injectable()
export class ViolationsIntegrationService {
  private readonly logger = new Logger(ViolationsIntegrationService.name);

  constructor(
    @Inject(forwardRef(() => AutoReferralService))
    private readonly autoReferralService: AutoReferralService,
  ) {}

  /**
   * Called when SP2 is generated
   * Automatically creates a guidance referral with orange/high risk level
   */
  async onSP2Generated(
    studentId: number,
    studentName: string,
    violationCount: number,
    violationDetails: any[],
    tahun: number,
  ): Promise<void> {
    try {
      this.logger.log(
        `SP2 generated for student ${studentId} (${studentName}) - triggering bimbingan referral`,
      );

      await this.autoReferralService.handleViolationReferral(
        studentId,
        studentName,
        'SP2',
        violationCount,
        violationDetails,
        tahun,
      );
    } catch (error) {
      this.logger.error(
        `Failed to create referral after SP2: ${error.message}`,
      );
    }
  }

  /**
   * Called when SP3 is generated
   * Automatically creates a guidance referral with red/very high risk level
   * Also flags for immediate intervention
   */
  async onSP3Generated(
    studentId: number,
    studentName: string,
    violationCount: number,
    violationDetails: any[],
    tahun: number,
  ): Promise<void> {
    try {
      this.logger.log(
        `SP3 generated for student ${studentId} (${studentName}) - URGENT bimbingan referral`,
      );

      await this.autoReferralService.handleViolationReferral(
        studentId,
        studentName,
        'SP3',
        violationCount,
        violationDetails,
        tahun,
      );

      // TODO: Send urgent notification to BK department
      // TODO: Escalate to school leadership
      // this.notificationService.sendUrgentNotification(...);
    } catch (error) {
      this.logger.error(
        `Failed to create referral after SP3: ${error.message}`,
      );
    }
  }
}
