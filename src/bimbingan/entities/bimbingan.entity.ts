import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * ===== BIMBINGAN/GUIDANCE MODULE ENTITIES =====
 * Comprehensive guidance and counseling system
 * Integrates with Attendance (Fitur 1), Tardiness (Fitur 2), Violations (Fitur 3)
 */

/**
 * GuidanceIntervention Type - Master Data
 * Defines types of guidance interventions available
 */
@Entity('guidance_intervention_types')
@Index(['code'])
export class GuidanceInterventionType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  code: string; // INDIVIDUAL, GROUP, PARENT_MEETING, CLASS_MEETING, etc

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string; // Bimbingan Individual, Bimbingan Kelompok, etc

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', default: 60 })
  estimated_duration_minutes: number; // Default session duration

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

/**
 * GuidanceTopic/Category - Master Data
 * Common guidance topics/issues
 */
@Entity('guidance_topics')
@Index(['code'])
export class GuidanceTopic {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  code: string; // ATTENDANCE, TARDINESS, VIOLATIONS, ACADEMIC, PERSONAL, FAMILY, etc

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string; // Indonesian: Kehadiran, Keterlambatan, Pelanggaran, etc

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

/**
 * GuidanceSession - Individual Guidance Record
 * Records each counseling/guidance session with student
 */
@Entity('guidance_sessions')
@Index(['student_id', 'created_at'])
@Index(['status'])
@Index(['scheduled_date'])
@Index(['bk_staff_id'])
export class GuidanceSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Reference to student
  @Column({ type: 'int', nullable: false })
  student_id: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  student_name: string;

  @Column({ type: 'int', nullable: false })
  class_id: number;

  // Session details
  @Column({ type: 'varchar', length: 36, nullable: true })
  intervention_type_id: string; // FK to GuidanceInterventionType

  @Column({ type: 'varchar', length: 36, nullable: true })
  topic_id: string; // FK to GuidanceTopic

  @Column({ type: 'varchar', length: 50, nullable: true })
  topic_code: string; // ATTENDANCE, TARDINESS, VIOLATIONS, ACADEMIC, etc

  // BK Staff (Counselor)
  @Column({ type: 'varchar', length: 100, nullable: false })
  bk_staff_id: string; // User ID of counselor

  @Column({ type: 'varchar', length: 100, nullable: false })
  bk_staff_name: string;

  // Auto-referral info
  @Column({ type: 'varchar', length: 36, nullable: true })
  referral_source_id: string; // Which module triggered this (violation_id, tardiness_id, etc)

  @Column({ type: 'varchar', length: 50, nullable: true })
  referral_source_type: string; // violation, tardiness, attendance, manual

  @Column({ type: 'varchar', length: 36, nullable: true })
  referral_source_data: string; // JSON: original issue details

  // Scheduling
  @Column({ type: 'timestamp', nullable: false })
  scheduled_date: Date;

  @Column({ type: 'time', nullable: true })
  scheduled_time: string; // HH:MM

  @Column({ type: 'timestamp', nullable: true })
  actual_date: Date; // When session actually happened

  @Column({ type: 'int', nullable: true })
  duration_minutes: number;

  // Session status
  @Column({ type: 'varchar', length: 30, default: 'scheduled' })
  status: string; // scheduled, in-progress, completed, postponed, cancelled, no-show

  @Column({ type: 'boolean', default: false })
  student_attended: boolean;

  @Column({ type: 'boolean', default: false })
  parent_attended: boolean;

  // Session notes and outcomes
  @Column({ type: 'text', nullable: true })
  session_notes: string; // Detailed notes from counselor

  @Column({ type: 'text', nullable: true })
  student_response: string; // How student responded

  @Column({ type: 'text', nullable: true })
  intervention_plan: string; // Action plan agreed upon

  @Column({ type: 'text', nullable: true })
  follow_up_plan: string; // What happens next

  // Outcomes
  @Column({ type: 'varchar', length: 30, nullable: true })
  outcome: string; // improved, stable, worsening, resolved, referred

  @Column({ type: 'int', default: 0 })
  progress_score: number; // 0-100 scale

  // References for tracking
  @Column({ type: 'varchar', length: 36, nullable: true })
  sp_letter_id: string; // If linked to SP letter

  @Column({ type: 'simple-array', nullable: true })
  related_session_ids: string[]; // Other related sessions

  // Follow-up
  @Column({ type: 'timestamp', nullable: true })
  next_session_date: Date;

  @Column({ type: 'boolean', default: false })
  requires_parent_involvement: boolean;

  @Column({ type: 'boolean', default: false })
  requires_teacher_coordination: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  created_by: string;
}

/**
 * CaseNote - Detailed Notes for Guidance Sessions
 * Structured documentation of counseling interactions
 */
@Entity('case_notes')
@Index(['guidance_session_id'])
@Index(['student_id', 'created_at'])
export class CaseNote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36, nullable: false })
  guidance_session_id: string; // FK to GuidanceSession

  @Column({ type: 'int', nullable: false })
  student_id: number;

  // Assessment
  @Column({ type: 'text', nullable: true })
  student_condition: string; // Kondisi siswa saat ini

  @Column({ type: 'text', nullable: true })
  problem_statement: string; // Analisis masalah

  @Column({ type: 'text', nullable: true })
  root_cause_analysis: string; // Analisis akar masalah

  // Intervention details
  @Column({ type: 'text', nullable: true })
  intervention_given: string; // Apa yang diberikan

  @Column({ type: 'text', nullable: true })
  student_understanding: string; // Pemahaman siswa terhadap usulan

  // Observation and assessment
  @Column({ type: 'text', nullable: true })
  behavioral_observations: string; // Observasi perilaku

  @Column({ type: 'text', nullable: true })
  emotional_state: string; // Kondisi emosi (cooperative, defensive, sad, angry, etc)

  @Column({ type: 'text', nullable: true })
  motivation_level: string; // Tingkat motivasi (high, medium, low)

  // Goals and agreements
  @Column({ type: 'text', nullable: true })
  goals_agreed: string; // Target yang disepakati

  @Column({ type: 'text', nullable: true })
  student_commitment: string; // Komitmen siswa dalam mengikuti usulan

  // Recommendations
  @Column({ type: 'text', nullable: true })
  recommendations: string; // Saran untuk siswa

  @Column({ type: 'text', nullable: true })
  parent_recommendations: string; // Saran untuk orang tua

  @Column({ type: 'text', nullable: true })
  teacher_recommendations: string; // Saran untuk guru

  // Referrals
  @Column({ type: 'boolean', default: false })
  referred_to_specialist: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  specialist_type: string; // Psikolog, Dokter, dll

  @Column({ type: 'text', nullable: true })
  referral_reason: string;

  // Follow-up
  @Column({ type: 'timestamp', nullable: true })
  follow_up_date: Date;

  @Column({ type: 'text', nullable: true })
  follow_up_action: string;

  @Column({ type: 'boolean', default: false })
  is_confidential: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'varchar', length: 100, nullable: false })
  created_by: string; // BK staff who wrote note
}

/**
 * GuidanceStatus - Current Guidance Status per Student
 * Tracks overall guidance status and progress
 */
@Entity('guidance_statuses')
@Index(['student_id', 'tahun'])
@Index('idx_student_year_unique', ['student_id', 'tahun'], { unique: true })
export class GuidanceStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', nullable: false })
  student_id: number;

  @Column({ type: 'int', nullable: false })
  tahun: number;

  // Status tracking
  @Column({ type: 'varchar', length: 30, default: 'active' })
  status: string; // active, monitoring, intensive, resolved, referred

  @Column({ type: 'int', default: 0 })
  total_sessions: number;

  @Column({ type: 'int', default: 0 })
  completed_sessions: number;

  @Column({ type: 'int', default: 0 })
  individual_sessions: number;

  @Column({ type: 'int', default: 0 })
  group_sessions: number;

  @Column({ type: 'int', default: 0 })
  parent_session_count: number;

  // Health indicators
  @Column({ type: 'varchar', length: 30, nullable: true })
  overall_progress: string; // improving, stable, declining

  @Column({ type: 'int', default: 0 })
  progress_percentage: number; // 0-100

  // Issue tracking
  @Column({ type: 'simple-array', nullable: true })
  current_issues: string[]; // attendance, tardiness, violations, academic, personal, family

  @Column({ type: 'simple-array', nullable: true })
  resolved_issues: string[];

  // Referral sources
  @Column({ type: 'int', default: 0 })
  violations_count: number;

  @Column({ type: 'int', default: 0 })
  tardiness_count: number;

  @Column({ type: 'int', default: 0 })
  absence_count: number;

  // Intensity level
  @Column({ type: 'varchar', length: 30, default: 'regular' })
  intervention_level: string; // regular (1x per month), frequent (2-3x per month), intensive (weekly), crisis (daily)

  // Key BK staff
  @Column({ type: 'varchar', length: 36, nullable: true })
  primary_bk_staff_id: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  primary_bk_staff_name: string;

  // Dates
  @Column({ type: 'timestamp', nullable: true })
  first_session_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_session_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  next_session_date: Date;

  // Additional tracking
  @Column({ type: 'text', nullable: true })
  case_summary: string; // Brief summary of case

  @Column({ type: 'boolean', default: false })
  parent_involved: boolean;

  @Column({ type: 'boolean', default: false })
  requires_specialist_follow_up: boolean;

  @Column({ type: 'text', nullable: true })
  recommendations: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

/**
 * GuidanceReferral - Auto-referral from Other Modules
 * Tracks automatic referrals from Fitur 1, 2, 3
 */
@Entity('guidance_referrals')
@Index(['student_id', 'referral_date'])
@Index(['status'])
@Index(['source_module'])
export class GuidanceReferral {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', nullable: false })
  student_id: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  student_name: string;

  // Referral source
  @Column({ type: 'varchar', length: 30, nullable: false })
  source_module: string; // attendance, tardiness, violations, manual

  @Column({ type: 'varchar', length: 36, nullable: false })
  source_record_id: string; // ID of violation/tardiness/attendance record

  @Column({ type: 'text', nullable: true })
  source_data: string; // JSON of source record details

  // Referral details
  @Column({ type: 'varchar', length: 100, nullable: false })
  reason: string; // Why referral was triggered

  @Column({ type: 'text', nullable: true })
  description: string;

  // Severity assessment
  @Column({ type: 'varchar', length: 30, default: 'normal' })
  priority: string; // normal, urgent, crisis

  @Column({ type: 'int', default: 1 })
  severity_score: number; // 1-5 scale (5 = most severe)

  // Status
  @Column({ type: 'varchar', length: 30, default: 'pending' })
  status: string; // pending, accepted, in_progress, completed, dismissed

  // Assigned to BK staff
  @Column({ type: 'varchar', length: 36, nullable: true })
  assigned_to_bk_id: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  assigned_to_bk_name: string;

  @Column({ type: 'timestamp', nullable: true })
  assigned_date: Date;

  // Linked guidance session
  @Column({ type: 'varchar', length: 36, nullable: true })
  guidance_session_id: string;

  // Dates
  @Column({ type: 'timestamp', nullable: false })
  referral_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  response_date: Date;

  @Column({ type: 'text', nullable: true })
  response_notes: string;

  @Column({ type: 'text', nullable: true })
  action_taken: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

/**
 * GuidanceProgress - Progress Tracking per Issue
 * Tracks improvement/decline for each issue over time
 */
@Entity('guidance_progress')
@Index(['student_id', 'tahun', 'issue_topic'])
export class GuidanceProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', nullable: false })
  student_id: number;

  @Column({ type: 'int', nullable: false })
  tahun: number;

  @Column({ type: 'varchar', length: 50, nullable: false })
  issue_topic: string; // attendance, tardiness, violations, academic, personal, family

  // Progress metrics
  @Column({ type: 'int', default: 0 })
  initial_severity: number; // 1-5 when first identified

  @Column({ type: 'int', default: 0 })
  current_severity: number; // 1-5 current level

  @Column({ type: 'int', default: 0 })
  target_severity: number; // 1-5 target

  @Column({ type: 'int', default: 0 })
  sessions_completed: number;

  @Column({ type: 'int', default: 0 })
  progress_percentage: number; // 0-100

  // Timeline
  @Column({ type: 'timestamp', nullable: false })
  start_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  expected_resolution_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  actual_resolution_date: Date;

  // Tracking data
  @Column({ type: 'text', nullable: true })
  progress_notes: string;

  @Column({ type: 'simple-array', nullable: true })
  milestone_dates: string[]; // CSV of milestone achievement dates

  @Column({ type: 'varchar', length: 30, nullable: true })
  status: string; // in-progress, improving, stable, regressing, resolved

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

/**
 * GuidanceIntervention - Individual Intervention Records
 * Documents specific interventions given to student
 */
@Entity('guidance_interventions')
@Index(['guidance_session_id'])
@Index(['student_id'])
export class GuidanceIntervention {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36, nullable: false })
  guidance_session_id: string;

  @Column({ type: 'int', nullable: false })
  student_id: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  student_name: string;

  // Intervention type
  @Column({ type: 'varchar', length: 100, nullable: false })
  intervention_type: string; // technique name

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  technique_used: string; // What technique/method used

  // Response and effectiveness
  @Column({ type: 'varchar', length: 30, nullable: true })
  student_response: string; // positive, neutral, negative

  @Column({ type: 'int', default: 0 })
  effectiveness_score: number; // 1-5 how effective

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Follow-up
  @Column({ type: 'boolean', default: false })
  requires_follow_up: boolean;

  @Column({ type: 'varchar', length: 36, nullable: true })
  follow_up_session_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
