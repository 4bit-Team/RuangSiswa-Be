import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

/**
 * TardinessRecord Entity
 * 
 * Stores daily tardiness records for students
 * Tracks when a student was late, by how many minutes, and evidence
 */
@Entity('tardiness_records')
@Index('idx_tardiness_student_tanggal', ['student_id', 'tanggal'], { unique: true })
@Index('idx_tardiness_class_tanggal', ['class_id', 'tanggal'])
@Index('idx_tardiness_student_status', ['student_id', 'status'])
export class TardinessRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  student_id: number;

  @Column({ type: 'varchar', length: 255 })
  student_name: string;

  @Column({ type: 'int' })
  class_id: number;

  @Column({ type: 'date' })
  tanggal: string; // Format: YYYY-MM-DD

  @Column({ type: 'int' })
  keterlambatan_menit: number; // Minutes late (e.g., 5, 15, 30)

  @Column({ type: 'varchar', length: 50 })
  status: string; // submitted, verified, resolved, disputed

  @Column({ type: 'text', nullable: true })
  alasan: string; // Student's reason for being late

  @Column({ type: 'varchar', length: 255, nullable: true })
  bukti_foto: string; // Path to evidence photo

  @Column({ type: 'text', nullable: true })
  catatan_petugas: string; // Note from staff/teacher

  @Column({ type: 'boolean', default: false })
  has_appeal: boolean; // Has student appealed this tardiness?

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  created_by: string; // User who created this record

  @Column({ type: 'varchar', length: 255, nullable: true })
  verified_by: string; // User who verified this record
}

/**
 * TardinessAppeal Entity
 * 
 * Students can appeal tardiness records if they believe it's invalid
 * Tracks appeal status and BK decision
 */
@Entity('tardiness_appeals')
@Index('idx_appeal_record', ['tardiness_record_id'])
@Index('idx_appeal_student_status', ['student_id', 'status'])
@Index('idx_appeal_resolved', ['is_resolved'])
export class TardinessAppeal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  tardiness_record_id: string; // Foreign key to TardinessRecord

  @Column({ type: 'int' })
  student_id: number;

  @Column({ type: 'text' })
  alasan_appeal: string; // Student's reason for appeal

  @Column({ type: 'varchar', length: 255, nullable: true })
  bukti_appeal: string; // Path to appeal evidence

  @Column({ type: 'varchar', length: 50 })
  status: string; // pending, accepted, rejected

  @Column({ type: 'text', nullable: true })
  catatan_bk: string; // BK decision notes

  @Column({ type: 'boolean', default: false })
  is_resolved: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  resolved_by: string; // BK staff who resolved

  @Column({ type: 'timestamp', nullable: true })
  resolved_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

/**
 * TardinessSummary Entity
 * 
 * Monthly summary of tardiness for each student
 * Helps with quick access to monthly statistics and pattern detection
 * Used to trigger alerts and violations
 */
@Entity('tardiness_summaries')
@Index('idx_tardsumm_student_month', ['student_id', 'tahun_bulan'], { unique: true })
@Index('idx_tardsumm_flagged', ['is_flagged'])
@Index('idx_tardsumm_count_threshold', ['count_total', 'threshold_status'])
export class TardinessSummary {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  student_id: number;

  @Column({ type: 'int' })
  class_id: number;

  @Column({ type: 'varchar', length: 7 })
  tahun_bulan: string; // Format: YYYY-MM

  @Column({ type: 'int', default: 0 })
  count_total: number; // Total tardiness incidents in month

  @Column({ type: 'int', default: 0 })
  count_verified: number; // Verified incidents

  @Column({ type: 'int', default: 0 })
  count_disputed: number; // Appealed incidents

  @Column({ type: 'int', default: 0 })
  total_menit: number; // Total minutes late in month

  @Column({ type: 'varchar', length: 50 })
  threshold_status: string; // ok (0-2), warning (3-4), critical (5+)

  @Column({ type: 'boolean', default: false })
  is_flagged: boolean; // Flag for counselor attention (5+ tardiness)

  @Column({ type: 'text', nullable: true })
  reason_if_flagged: string; // Why it was flagged

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

/**
 * TardinessAlert Entity
 * 
 * Auto-generated alerts when student reaches certain thresholds
 * Alerts counselors and administrators of high-risk patterns
 */
@Entity('tardiness_alerts')
@Index('idx_tardalert_student_type', ['student_id', 'alert_type'])
@Index('idx_tardalert_resolved', ['is_resolved'])
export class TardinessAlert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  student_id: number;

  @Column({ type: 'varchar', length: 255 })
  student_name: string;

  @Column({ type: 'varchar', length: 50 })
  alert_type: string; // high_tardiness, pattern_change, repeated_appeals

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 50 })
  severity: string; // warning, critical

  @Column({ type: 'text', nullable: true })
  alert_data: string; // JSON string storing alert context (current month count, previous month, etc)

  @Column({ type: 'boolean', default: false })
  is_resolved: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  resolved_by: string; // Counselor who handled

  @Column({ type: 'timestamp', nullable: true })
  resolved_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

/**
 * TardinessPattern Entity (Optional but recommended)
 * 
 * Identifies patterns in tardiness (patterns like always late on Monday, or after certain events)
 * Helps with early intervention
 */
@Entity('tardiness_patterns')
@Index('idx_pattern_student', ['student_id'])
export class TardinessPattern {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  student_id: number;

  @Column({ type: 'varchar', length: 50 })
  pattern_type: string; // day_of_week, time_period, monthly_trend, post_event

  @Column({ type: 'varchar', length: 255 })
  pattern_description: string; // e.g., "Late every Monday", "Always 10-15 min late", "Increased in March"

  @Column({ type: 'float' })
  confidence_score: number; // 0.0-1.0, how confident we are about this pattern

  @Column({ type: 'int' })
  occurrences: number; // How many times this pattern appeared

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
