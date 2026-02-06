import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

/**
 * ===== BIMBINGAN/GUIDANCE SYSTEM ENTITIES =====
 * 
 * Tracks student guidance cases, counseling sessions, interventions, and progress
 * Auto-integrates with Attendance (Fitur 1), Tardiness (Fitur 2), and Violations (Fitur 3)
 */

/**
 * GuidanceCategory - Master data for guidance case types
 * Examples: Attendance issues, Academic problems, Behavioral issues, Social problems, etc.
 */
@Entity('guidance_categories')
@Index(['code'], { unique: true })
@Index(['is_active'])
export class GuidanceCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  name: string; // e.g., "Keterlambatan", "Akademik", "Perilaku", "Sosial Pribadi"

  @Column({ type: 'varchar', length: 20, unique: true })
  code: string; // e.g., "ATTENDANCE", "ACADEMIC", "BEHAVIOR", "SOCIAL"

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', default: 1 })
  priority_level: number; // 1-5, where 5 is highest priority

  @Column({ type: 'varchar', length: 50, nullable: true })
  recommended_duration_weeks: string; // e.g., "4-6 weeks"

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

/**
 * GuidanceCase - Individual guidance case for a student
 * Created automatically from: excessive absences (Fitur 1), tardiness (Fitur 2), or violations (Fitur 3)
 */
@Entity('guidance_cases')
@Index(['student_id', 'tahun'])
@Index(['status'])
@Index(['risk_level'])
@Index(['created_at'])
export class GuidanceCase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  student_id: number;

  @Column({ type: 'varchar', length: 100 })
  student_name: string;

  @Column({ type: 'int' })
  class_id: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  class_name: string;

  @Column({ type: 'uuid' })
  guidance_category_id: string;

  @Column({ type: 'varchar', length: 50 })
  category_code: string; // Cached for quick filtering

  // Referral sources (can have multiple)
  @Column({ type: 'varchar', length: 20, nullable: true })
  referred_from: string; // "attendance", "tardiness", "violation", "teacher", "parent"

  @Column({ type: 'uuid', nullable: true })
  referred_from_id: string; // Source ID (tardiness_id, violation_id, etc.)

  // Case details
  @Column({ type: 'text' })
  case_description: string; // Summary of the problem

  @Column({ type: 'text', nullable: true })
  background_info: string; // Student background, family situation, etc.

  @Column({ type: 'date' })
  case_opened_date: string; // YYYY-MM-DD

  @Column({ type: 'date', nullable: true })
  case_closed_date: string; // YYYY-MM-DD

  // Case status
  @Column({
    type: 'enum',
    enum: ['open', 'in_progress', 'suspended', 'closed', 'referred'],
    default: 'open',
  })
  status: string;

  // Risk assessment
  @Column({
    type: 'enum',
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  })
  risk_level: string; // Automatically calculated from combined Fitur 1-3 scores

  // Combined risk score (0-100)
  @Column({ type: 'int', default: 0 })
  risk_score: number;

  // Risk calculation components
  @Column({ type: 'int', default: 0 })
  attendance_risk_score: number; // From Fitur 1 (0-33)

  @Column({ type: 'int', default: 0 })
  tardiness_risk_score: number; // From Fitur 2 (0-33)

  @Column({ type: 'int', default: 0 })
  violation_risk_score: number; // From Fitur 3 (0-34)

  // Recommended actions
  @Column({ type: 'text', nullable: true })
  recommended_interventions: string; // JSON list of recommended interventions

  @Column({ type: 'int', default: 0 })
  total_sessions_planned: number;

  @Column({ type: 'int', default: 0 })
  total_sessions_completed: number;

  // Year tracking
  @Column({ type: 'int' })
  tahun: number;

  @Column({ type: 'uuid', nullable: true })
  assigned_to_bk: string; // BK staff user_id

  @Column({ type: 'varchar', length: 100, nullable: true })
  assigned_to_bk_name: string;

  @Column({ type: 'boolean', default: false })
  is_escalated: boolean; // Escalated to higher authority

  @Column({ type: 'text', nullable: true })
  escalation_reason: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

/**
 * GuidanceSession - Individual counseling/guidance session
 * Scheduled meetings between BK staff and student
 */
@Entity('guidance_sessions')
@Index(['guidance_case_id'])
@Index(['student_id', 'session_date'])
@Index(['status'])
export class GuidanceSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  guidance_case_id: string;

  @Column({ type: 'varchar', length: 36, nullable: true })
  referral_id: string; // Link to referral if this is a referral follow-up

  @Column({ type: 'int' })
  student_id: number;

  @Column({ type: 'int', nullable: true })
  sesi_ke: number; // Session number

  @Column({ type: 'uuid' })
  bk_staff_id: string; // BK counselor user_id

  @Column({ type: 'varchar', length: 100, nullable: true })
  bk_staff_name: string;

  // Session scheduling
  @Column({ type: 'timestamp' })
  session_date: string; // YYYY-MM-DD HH:mm

  @Column({ type: 'timestamp', nullable: true })
  tanggal_sesi: Date; // Alternate date column

  @Column({ type: 'int', default: 30 })
  duration_minutes: number; // Session length

  @Column({
    type: 'enum',
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
    default: 'scheduled',
  })
  status: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  session_type: string; // "individual", "group", "parent_meeting", "follow_up"

  // Session location
  @Column({ type: 'varchar', length: 100, nullable: true })
  location: string; // e.g., "BK Office", "Campus", "Virtual"

  // Session content
  @Column({ type: 'text', nullable: true })
  agenda: string; // What will be discussed

  @Column({ type: 'text', nullable: true })
  notes: string; // What was discussed during session

  @Column({ type: 'text', nullable: true })
  student_response: string; // How student reacted/responded

  @Column({ type: 'text', nullable: true })
  recommendations: string; // Recommendations from this session

  // Session outcome
  @Column({ type: 'boolean', default: false })
  student_attended: boolean;

  @Column({ type: 'boolean', default: false })
  siswa_hadir: boolean; // Alternate attended column

  @Column({ type: 'varchar', length: 50, nullable: true })
  outcome: string; // "positive", "neutral", "negative", "breakthrough"

  @Column({ type: 'int', nullable: true })
  effectiveness_rating: number; // 1-5 scale

  // Follow-up
  @Column({ type: 'text', nullable: true })
  followup_actions: string; // Actions to take after session

  @Column({ type: 'date', nullable: true })
  next_session_date: string; // When is next session scheduled

  @Column({ type: 'date', nullable: true })
  follow_up_date: Date; // Alternate follow-up date column

  @Column({ type: 'boolean', nullable: true })
  orang_tua_hadir: boolean; // Parent attended

  @Column({ type: 'text', nullable: true })
  hasil_akhir: string; // Final result/outcome of session

  @Column({ type: 'varchar', length: 50, nullable: true })
  follow_up_status: string; // Status of follow-up

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

/**
 * GuidanceNote - Case notes and progress tracking
 * Detailed documentation of observations and progress
 */
@Entity('guidance_notes')
@Index(['guidance_case_id'])
@Index(['created_by'])
@Index(['created_at'])
export class GuidanceNote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  guidance_case_id: string;

  @Column({ type: 'int' })
  student_id: number;

  @Column({ type: 'text' })
  note_content: string;

  @Column({
    type: 'enum',
    enum: ['observation', 'progress_update', 'parent_communication', 'incident', 'breakthrough'],
    default: 'observation',
  })
  note_type: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  sentiment: string; // "positive", "neutral", "negative"

  // Who created the note
  @Column({ type: 'uuid' })
  created_by: string; // User ID

  @Column({ type: 'varchar', length: 100, nullable: true })
  created_by_name: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  created_by_role: string; // "BK", "Teacher", "Parent"

  // Attachments
  @Column({ type: 'json', nullable: true })
  attachments: string[]; // File paths of attached documents

  @Column({ type: 'varchar', length: 50, nullable: true })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

/**
 * GuidanceIntervention - Specific interventions assigned to student
 * Examples: Career counseling, Academic tutoring, Anger management, etc.
 */
@Entity('guidance_interventions')
@Index(['guidance_case_id'])
@Index(['student_id'])
@Index(['status'])
export class GuidanceIntervention {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  guidance_case_id: string;

  @Column({ type: 'int' })
  student_id: number;

  @Column({ type: 'varchar', length: 100 })
  intervention_name: string; // e.g., "Career Counseling", "Academic Support"

  @Column({ type: 'text' })
  intervention_description: string;

  @Column({
    type: 'enum',
    enum: ['counseling', 'tutoring', 'skills_training', 'parent_involvement', 'referral_external', 'monitoring'],
    default: 'counseling',
  })
  intervention_type: string;

  @Column({ type: 'date' })
  start_date: string; // YYYY-MM-DD

  @Column({ type: 'date', nullable: true })
  end_date: string;

  @Column({
    type: 'enum',
    enum: ['planned', 'in_progress', 'completed', 'discontinued'],
    default: 'planned',
  })
  status: string;

  // Responsible party
  @Column({ type: 'uuid', nullable: true })
  responsible_party_id: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  responsible_party_name: string;

  // Progress tracking
  @Column({ type: 'text', nullable: true })
  progress_notes: string;

  @Column({ type: 'int', nullable: true })
  completion_percentage: number; // 0-100%

  @Column({ type: 'text', nullable: true })
  outcomes: string; // Results of intervention

  @Column({ type: 'text', nullable: true })
  hasil_intervensi: string; // Alternative outcomes field

  @Column({ type: 'varchar', length: 50, nullable: true })
  tanggal_evaluasi: string;

  @Column({ type: 'int', nullable: true })
  efektivitas: number;

  @Column({ type: 'boolean', nullable: true })
  orang_tua_hadir: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

/**
 * GuidanceParentCommunication - Track parent/guardian communications
 * Important for parental involvement in guidance process
 */
@Entity('guidance_parent_communications')
@Index(['guidance_case_id'])
@Index(['student_id'])
@Index(['communication_date'])
export class GuidanceParentCommunication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  guidance_case_id: string;

  @Column({ type: 'int' })
  student_id: number;

  @Column({ type: 'varchar', length: 100 })
  parent_name: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  parent_contact: string;

  @Column({ type: 'timestamp' })
  communication_date: string;

  @Column({
    type: 'enum',
    enum: ['call', 'sms', 'email', 'meeting', 'letter'],
    default: 'call',
  })
  communication_type: string;

  @Column({ type: 'text' })
  communication_content: string; // What was discussed

  @Column({ type: 'text', nullable: true })
  parent_response: string; // Parent's response/feedback

  @Column({ type: 'boolean', default: false })
  parent_agreed_to_involve: boolean; // Does parent agree to participate in guidance

  @Column({ type: 'uuid' })
  communicated_by: string; // BK staff who made communication

  @Column({ type: 'varchar', length: 100, nullable: true })
  communicated_by_name: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

/**
 * GuidanceProgress - Overall progress tracking for guidance case
 * Measures improvement in student behavior, attendance, grades
 */
@Entity('guidance_progress')
@Index(['guidance_case_id'])
@Index(['student_id', 'assessment_date'])
export class GuidanceProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  guidance_case_id: string;

  @Column({ type: 'uuid', nullable: true })
  referral_id: string; // Link to referral if applicable

  @Column({ type: 'int' })
  student_id: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  student_name: string;

  @Column({ type: 'uuid', nullable: true })
  counselor_id: string;

  @Column({ type: 'date' })
  assessment_date: string; // YYYY-MM-DD (when progress was assessed)

  @Column({ type: 'varchar', length: 50, nullable: true })
  tanggal_evaluasi: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  status_keseluruhan: string;

  // Pre/Post intervention comparison
  @Column({ type: 'int', nullable: true })
  previous_attendance_percentage: number; // e.g., 70%

  @Column({ type: 'int', nullable: true })
  current_attendance_percentage: number;

  @Column({ type: 'int', nullable: true })
  previous_tardiness_count: number;

  @Column({ type: 'int', nullable: true })
  current_tardiness_count: number;

  @Column({ type: 'int', nullable: true })
  previous_violation_count: number;

  @Column({ type: 'int', nullable: true })
  current_violation_count: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  previous_gpa: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  current_gpa: number;

  // Behavioral/attitude changes
  @Column({ type: 'text', nullable: true })
  behavioral_observations: string; // e.g., "More engaged in class", "Better attitude"

  @Column({ type: 'int', nullable: true })
  overall_improvement_score: number; // 1-10 scale

  @Column({
    type: 'enum',
    enum: ['excellent', 'good', 'fair', 'poor', 'no_change'],
    default: 'fair',
  })
  progress_assessment: string;

  @Column({ type: 'text', nullable: true })
  assessment_comments: string;

  // Assessment by
  @Column({ type: 'uuid' })
  assessed_by: string; // BK staff user_id

  @Column({ type: 'varchar', length: 100, nullable: true })
  assessed_by_name: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

/**
 * GuidanceReferral - Referrals to external services
 * When student needs specialized help (psychologist, medical, etc.)
 */
@Entity('guidance_referrals')
@Index(['student_id', 'tahun'])
@Index(['referral_status'])
@Index(['risk_level'])
export class GuidanceReferral {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  guidance_case_id: string;

  @Column({ type: 'int' })
  student_id: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  student_name: string;

  @Column({ type: 'int', nullable: true })
  class_id: number;

  @Column({ type: 'int' })
  tahun: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  referral_type: string; // e.g., "Psychologist", "Medical", "Social Services"

  @Column({ type: 'text' })
  referral_reason: string; // Why is referral needed

  @Column({ type: 'varchar', length: 50, nullable: true })
  risk_level: string; // red, orange, yellow

  @Column({ type: 'varchar', length: 100, nullable: true })
  external_agency: string; // Name of external agency

  @Column({ type: 'varchar', length: 20, nullable: true })
  contact_person: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  contact_number: string;

  @Column({ type: 'date' })
  referral_date: Date;

  @Column({
    type: 'enum',
    enum: ['pending', 'accepted', 'in_progress', 'completed', 'declined'],
    default: 'pending',
  })
  referral_status: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  status: string; // pending, in_progress, completed

  @Column({ type: 'date', nullable: true })
  completed_date: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'json', nullable: true })
  referral_source: { source: string; source_id: string; details: string } | null;

  @Column({ type: 'date', nullable: true })
  first_appointment_date: string;

  @Column({ type: 'uuid', nullable: true })
  counselor_id: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  counselor_name: string;

  @Column({ type: 'date', nullable: true })
  assigned_date: string;

  @Column({ type: 'text', nullable: true })
  external_assessment_report: string; // Report from external agency

  @Column({ type: 'text', nullable: true })
  recommendations_from_external: string; // Recommendations from specialist

  @Column({ type: 'uuid', nullable: true })
  referred_by: string; // BK staff user_id

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

/**
 * GuidanceStatistics - Aggregate statistics for dashboards
 * Cached for performance optimization
 */
@Entity('guidance_statistics')
@Index(['tahun'])
export class GuidanceStatistics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  tahun: number;

  @Column({ type: 'int', default: 0 })
  total_cases_open: number;

  @Column({ type: 'int', default: 0 })
  total_cases_closed: number;

  @Column({ type: 'int', default: 0 })
  total_cases_referred: number;

  @Column({ type: 'int', default: 0 })
  total_sessions_completed: number;

  @Column({ type: 'int', default: 0 })
  critical_risk_count: number; // Students at critical risk

  @Column({ type: 'int', default: 0 })
  high_risk_count: number;

  @Column({ type: 'int', default: 0 })
  medium_risk_count: number;

  @Column({ type: 'int', default: 0 })
  low_risk_count: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  average_case_duration_weeks: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  case_resolution_rate_percentage: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  average_improvement_score: number; // 1-10 scale

  // Most common issues
  @Column({ type: 'varchar', length: 100, nullable: true })
  most_common_category: string;

  @Column({ type: 'int', default: 0 })
  parent_involvement_percentage: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

/**
 * Student Guidance Ability/Skill Assessment
 */
@Entity('guidance_abilities')
@Index(['guidance_case_id'])
@Index(['skill_type'])
export class GuidanceAbility {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  guidance_case_id: string;

  @Column({ type: 'varchar', length: 100 })
  skill_type: string; // e.g., "Communication", "Problem Solving", "Self Control"

  @Column({ type: 'int', default: 1 })
  proficiency_level: number; // 1-5 scale

  @Column({ type: 'text', nullable: true })
  assessment_notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

/**
 * Guidance Goals/Targets
 */
@Entity('guidance_targets')
@Index(['guidance_case_id'])
@Index(['status'])
export class GuidanceTarget {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  guidance_case_id: string;

  @Column({ type: 'text' })
  target_description: string;

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  status: string; // pending, in_progress, completed, failed

  @Column({ type: 'date', nullable: true })
  target_date: Date;

  @Column({ type: 'int', default: 0 })
  progress_percentage: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

/**
 * Guidance Case Status History
 */
@Entity('guidance_statuses')
@Index(['student_id', 'tahun'])
@Index(['status_type'])
export class GuidanceStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  guidance_case_id: string;

  @Column({ type: 'int', nullable: true })
  student_id: number;

  @Column({ type: 'int', nullable: true })
  tahun: number;

  @Column({ type: 'varchar', length: 50 })
  status_type: string; // open, in_progress, resolved, closed

  @Column({ type: 'varchar', length: 50, nullable: true })
  status: string; // pending, in_progress, completed, referred

  @Column({ type: 'varchar', length: 50, nullable: true })
  previous_status: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  current_risk_level: string; // red, orange, yellow, green

  @Column({ type: 'text', nullable: true })
  status_notes: string;

  @Column({ type: 'int', default: 0 })
  total_referrals: number;

  @Column({ type: 'int', default: 0 })
  total_sessions: number;

  @Column({ type: 'int', default: 0 })
  total_interventions: number;

  @Column({ type: 'date', nullable: true })
  first_referral_date: Date;

  @Column({ type: 'varchar', length: 36, nullable: true })
  latest_referral_id: string;

  @Column({ type: 'date', nullable: true })
  last_session_date: Date;

  @Column({ type: 'date', nullable: true })
  next_session_date: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

// Export aliases for backward compatibility (both value and type)
export { GuidanceCategory as BimbinganCategory };
export { GuidanceReferral as BimbinganReferral };
export { GuidanceSession as BimbinganSesi };
export { GuidanceNote as BimbinganCatat };
export { GuidanceIntervention as BimbinganIntervensi };
export { GuidanceProgress as BimbinganPerkembangan };
export { GuidanceAbility as BimbinganAbility };
export { GuidanceTarget as BimbinganTarget };
export { GuidanceStatus as BimbinganStatus };
export { GuidanceStatistics as BimbinganStatistik };
