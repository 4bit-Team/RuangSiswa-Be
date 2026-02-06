/**
 * INTEGRATION HOOKS FOR FITUR 3 (VIOLATIONS) → FITUR 4 (BIMBINGAN)
 *
 * Add these methods to violations.service.ts and call them when:
 * 1. SP2 is created for a student
 * 2. SP3 is created for a student
 * 3. Violation is recorded
 *
 * These hooks automatically trigger guidance referrals in Fitur 4
 */

// ===== STEP 1: Add this import to violations.service.ts =====
import { AutoReferralService } from '../bimbingan/auto-referral.service';

// ===== STEP 2: Inject AutoReferralService into violations.service.ts constructor =====
constructor(
  @InjectRepository(Violation)
  private readonly violationRepository: Repository<Violation>,
  @InjectRepository(SanctionLetter)
  private readonly sanctionLetterRepository: Repository<SanctionLetter>,
  @InjectRepository(Student)
  private readonly studentRepository: Repository<Student>,
  private readonly spPdfService: SpPdfService,
  private readonly autoReferralService: AutoReferralService, // Add this line
  private readonly logger = new Logger(ViolationsService.name),
) {}

// ===== STEP 3: Add these integration hook methods to violations.service.ts =====

/**
 * Hook: Called when SP2 is automatically generated
 * Triggers: Automatic guidance referral with orange risk level
 */
async triggerSP2Referral(
  studentId: number,
  studentName: string,
  violationCount: number,
  violationDetails: any[],
  tahun: number,
): Promise<void> {
  try {
    await this.autoReferralService.handleViolationReferral(
      studentId,
      studentName,
      'SP2', // SP level
      violationCount,
      violationDetails,
      tahun,
    );
  } catch (error) {
    this.logger.error(`Failed to trigger SP2 referral: ${error.message}`);
    // Don't throw - SP generation should not fail due to referral service errors
  }
}

/**
 * Hook: Called when SP3 is automatically generated
 * Triggers: Automatic guidance referral with high/red risk level
 * May also trigger escalation to school discipline committee
 */
async triggerSP3Referral(
  studentId: number,
  studentName: string,
  violationCount: number,
  violationDetails: any[],
  tahun: number,
): Promise<void> {
  try {
    await this.autoReferralService.handleViolationReferral(
      studentId,
      studentName,
      'SP3', // SP level
      violationCount,
      violationDetails,
      tahun,
    );

    // TODO: Send notification to school discipline committee
    // this.notificationService.notifyDisciplineCommittee(studentId, 'SP3 issued');
  } catch (error) {
    this.logger.error(`Failed to trigger SP3 referral: ${error.message}`);
  }
}

// ===== STEP 4: Update recordViolation method to call these hooks =====
// Add after a violation is created and SP status is determined:

async recordViolation(dto: CreateViolationDto): Promise<Violation> {
  try {
    // ... existing violation creation logic ...

    const violation = await this.violationRepository.save(newViolation);

    // Check if this violation triggers SP generation
    const studentViolations = await this.violationRepository.find({
      where: { student_id: dto.student_id, tahun: dto.tahun },
    });

    const violationCount = studentViolations.length;
    const student = await this.studentRepository.findOne({
      where: { id: dto.student_id },
    });

    // SP1 threshold is 3 violations
    if (violationCount === 3) {
      // Generate SP1
      await this.generateSP1(student, violation, violationCount);
    }
    // SP2 threshold is 6 violations
    else if (violationCount === 6) {
      // Generate SP2
      await this.generateSP2(student, violation, violationCount);
      // INTEGRATION: Trigger guidance referral
      await this.triggerSP2Referral(
        student.id,
        student.name,
        violationCount,
        studentViolations,
        dto.tahun,
      );
    }
    // SP3 threshold is 9 violations
    else if (violationCount >= 9) {
      // Generate SP3
      await this.generateSP3(student, violation, violationCount);
      // INTEGRATION: Trigger guidance referral (red/very high risk)
      await this.triggerSP3Referral(
        student.id,
        student.name,
        violationCount,
        studentViolations,
        dto.tahun,
      );
    }

    return violation;
  } catch (error) {
    this.logger.error(`Failed to record violation: ${error.message}`);
    throw new HttpException(
      'Failed to record violation',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

// ===== STEP 5: Update bimbingan.module.ts to include AutoReferralService =====
// Add to bimbingan.module.ts providers and exports:

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BimbinganCategory,
      BimbinganReferral,
      BimbinganSesi,
      BimbinganCatat,
      BimbinganIntervensi,
      BimbinganPerkembangan,
      BimbinganAbility,
      BimbinganTarget,
      BimbinganStatus,
      BimbinganStatistik,
    ]),
  ],
  controllers: [BimbinganController],
  providers: [BimbinganService, AutoReferralService], // Add AutoReferralService
  exports: [BimbinganService, AutoReferralService], // Export for cross-module use
})
export class BimbinganModule {}

// ===== STEP 6: Update app.module.ts to import BimbinganModule BEFORE ViolationsModule =====
// This ensures BimbinganService and AutoReferralService are available when violations.service needs them

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot(databaseConfig),

    // ... other modules ...

    // Fitur 1-2 modules
    AuthModule,
    AdminModule,
    UsersModule,
    KelasModule,
    JurusanModule,
    
    // Fitur 3-4: IMPORTANT ORDER - Bimbingan BEFORE Violations
    BimbinganModule, // Must be before ViolationsModule
    ViolationsModule,
    
    // ... other modules ...
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

// ===== STEP 7: Update violations.module.ts to import BimbinganModule =====

@Module({
  imports: [
    TypeOrmModule.forFeature([Violation, SanctionLetter, Student]),
    BimbinganModule, // Add this import for AutoReferralService
  ],
  controllers: [ViolationsController],
  providers: [ViolationsService, SpPdfService],
  exports: [ViolationsService],
})
export class ViolationsModule {}

/**
 * ===== INTEGRATION WORKFLOW =====
 *
 * When a violation is recorded:
 * 1. Violation entity is created with violation_type, severity, reported_date
 * 2. Violation counter is incremented
 * 3. When counter reaches threshold (3, 6, 9):
 *    a. SP1, SP2, or SP3 is automatically generated
 *    b. If SP2 or SP3:
 *       - AutoReferralService.handleViolationReferral() is called
 *       - BimbinganReferral entity is created with:
 *         * student_id, student_name
 *         * referral_reason: "SP escalation"
 *         * risk_level: 'orange' (SP2) or 'red' (SP3)
 *         * referral_source: { source: 'violations_escalation', sp_level, violation_count }
 *         * is_urgent: true (SP3)
 *       - Status starts as 'pending' (awaiting counselor assignment)
 *       - Email notification sent to BK department
 * 4. BK department (counselor):
 *    a. Views at-risk students dashboard
 *    b. Sees new 'pending' referrals
 *    c. Assigns themselves to the referral (changes status to 'assigned')
 *    d. Schedules first guidance session
 *    e. Conducts sessions and records progress
 *    f. Can track improvement via progress evaluation scores
 * 5. System monitors:
 *    a. If student no longer receives violations → referral can be completed
 *    b. If student receives multiple referrals → escalates to school leadership team
 *    c. Risk level auto-updated based on latest violations + tardiness + absence data
 *
 * ===== DATA FLOW DIAGRAM =====
 *
 * Violations Module          →  Auto-Referral Service  →  Bimbingan Module
 * ─────────────────              ──────────────────        ──────────────
 * recordViolation()
 *   → violation count ≥ 6?   →  triggerSP2Referral()     →  createReferral()
 *                            →  handleViolationReferral()→  BimbinganReferral
 *                                                         →  BimbinganStatus
 *                                                         →  Auto-notify BK
 *
 * ===== CONFIGURATION THRESHOLDS =====
 * SP1: 3 violations (no referral)
 * SP2: 6 violations (orange risk, auto-referral)
 * SP3: 9+ violations (red risk, auto-referral, escalation)
 *
 * These thresholds can be configured in:
 * - environment variables: VIOLATION_SP2_THRESHOLD=6, VIOLATION_SP3_THRESHOLD=9
 * - or in violations service configuration
 *
 * ===== FUTURE ENHANCEMENTS =====
 * 1. Event emitters instead of direct service calls
 * 2. Message queue for async referral processing
 * 3. Multi-factor risk assessment combining all modules
 * 4. AI/ML for early intervention prediction
 * 5. Parent notification system
 * 6. Integration with school counseling records
 */
