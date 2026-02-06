import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

/**
 * ViolationCategory Entity
 * Master data for violation types (keterlambatan, membolos, merokok, etc)
 */
@Entity('violation_categories')
export class ViolationCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string; // e.g., "Keterlambatan Berulang", "Membolos", "Merokok", "Pakaian Tidak Rapi"

  @Column({ type: 'varchar', length: 50 })
  code: string; // e.g., "KET", "MEMBOLOS", "ROKOK", "PAKAIAN"

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'int' })
  sp_trigger_count: number; // Jumlah violations untuk auto-trigger SP (e.g., 3 = trigger SP after 3 violations)

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

/**
 * Violation Entity
 * Individual violation records for students
 */
@Entity('violations')
@Index(['student_id', 'created_at'])
@Index(['student_id', 'violation_category_id'])
@Index(['is_processed'])
export class Violation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  student_id: number;

  @Column({ type: 'varchar', length: 255 })
  student_name: string;

  @Column({ type: 'int' })
  class_id: number;

  @Column({ type: 'varchar' })
  violation_category_id: string; // FK to ViolationCategory

  @Column({ type: 'text' })
  description: string; // Detail pelanggaran

  @Column({ type: 'varchar', length: 255, nullable: true })
  bukti_foto: string; // Evidence photo path

  @Column({ type: 'text', nullable: true })
  catatan_petugas: string; // Notes from teacher/staff

  @Column({ type: 'int', default: 1 })
  severity: number; // 1 = minor, 2 = moderate, 3 = severe (used for SP calculation)

  @Column({ type: 'boolean', default: false })
  is_processed: boolean; // Has this violation been included in SP generation?

  @Column({ type: 'varchar', nullable: true })
  sp_letter_id: string; // FK to SpLetter if already included in SP

  @Column({ type: 'date' })
  tanggal_pelanggaran: string; // YYYY-MM-DD

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  created_by: string; // Teacher/staff who reported
}

/**
 * SpLetter Entity (Surat Perjanjian Murid)
 * Auto-generated warning letters based on accumulated violations
 */
@Entity('sp_letters')
@Index(['student_id', 'sp_level'])
@Index(['student_id', 'tahun'])
@Index(['status'])
@Index(['is_signed'])
export class SpLetter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  student_id: number;

  @Column({ type: 'varchar', length: 255 })
  student_name: string;

  @Column({ type: 'int' })
  class_id: number;

  @Column({ type: 'varchar', length: 50 })
  nis: string;

  @Column({ type: 'int' })
  sp_level: number; // 1, 2, or 3

  @Column({ type: 'varchar', length: 50 })
  sp_number: string; // Format: SP/YYYY/###/TYPE (e.g., SP/2025/001/KET)

  @Column({ type: 'varchar', length: 50 })
  sp_type: string; // KET=Keterlambatan, PEL=Pelanggaran, etc

  @Column({ type: 'int' })
  tahun: number; // Academic year (e.g., 2025)

  @Column({ type: 'text' })
  violations_text: string; // Comma-separated list of violation descriptions included in this SP

  @Column({ type: 'json' })
  violation_ids: string[]; // Array of violation IDs included

  @Column({ type: 'text' })
  consequences: string; // Sanksi/consequences for this SP level

  @Column({ type: 'varchar', length: 100, nullable: true })
  alamat_siswa: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  kompetensi_keahlian: string; // Class/expertise field

  @Column({ type: 'date' })
  tanggal_sp: string; // Date SP issued (YYYY-MM-DD)

  @Column({ type: 'varchar', length: 50 })
  status: string; // draft, issued, signed, archived

  @Column({ type: 'boolean', default: false })
  is_signed: boolean; // Has it been signed by parent/guardian?

  @Column({ type: 'date', nullable: true })
  signed_date: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  signed_by_parent: string; // Parent/guardian name who signed

  @Column({ type: 'varchar', length: 255, nullable: true })
  signed_by_bp_bk: string; // BP/BK staff who issued

  @Column({ type: 'varchar', length: 255, nullable: true })
  signed_by_wali_kelas: string; // Wali Kelas signature

  @Column({ type: 'int', nullable: true })
  material_cost: number; // Biaya material (e.g., 10000 for paper/printing)

  @Column({ type: 'varchar', length: 255, nullable: true })
  pdf_path: string; // Path to generated PDF file

  @Column({ type: 'text', nullable: true })
  notes: string; // Additional notes

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

/**
 * SpProgression Entity
 * Tracks SP progression for each student per academic year
 * Determines current SP level and when to auto-escalate
 */
@Entity('sp_progressions')
@Index(['student_id', 'tahun'], { unique: true })
@Index(['current_sp_level'])
export class SpProgression {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  student_id: number;

  @Column({ type: 'int' })
  tahun: number; // Academic year

  @Column({ type: 'int', default: 0 })
  current_sp_level: number; // 0=none, 1=SP1, 2=SP2, 3=SP3

  @Column({ type: 'int', default: 0 })
  violation_count: number; // Total violations in this year

  @Column({ type: 'int', default: 0 })
  sp1_issued_count: number; // How many SP1 letters issued

  @Column({ type: 'int', default: 0 })
  sp2_issued_count: number; // How many SP2 letters issued

  @Column({ type: 'int', default: 0 })
  sp3_issued_count: number; // How many SP3 letters issued

  @Column({ type: 'date', nullable: true })
  first_sp_date: string; // Date of first SP

  @Column({ type: 'date', nullable: true })
  last_sp_date: string; // Date of most recent SP

  @Column({ type: 'boolean', default: false })
  is_expelled: boolean; // Student expelled (after SP3)?

  @Column({ type: 'date', nullable: true })
  expulsion_date: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  reason_if_expelled: string; // Reason for expulsion

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

/**
 * ViolationExcuse Entity (Optional)
 * Students can submit excuses/reasons for violations (similar to tardiness appeals)
 */
@Entity('violation_excuses')
@Index(['violation_id'])
@Index(['student_id', 'status'])
export class ViolationExcuse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  violation_id: string; // FK to Violation

  @Column({ type: 'int' })
  student_id: number;

  @Column({ type: 'text' })
  excuse_text: string; // Student's reason/excuse

  @Column({ type: 'varchar', length: 255, nullable: true })
  bukti_excuse: string; // Supporting evidence

  @Column({ type: 'varchar', length: 50 })
  status: string; // pending, accepted, rejected

  @Column({ type: 'text', nullable: true })
  catatan_bk: string; // BK decision notes

  @Column({ type: 'boolean', default: false })
  is_resolved: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  resolved_by: string; // BK staff who reviewed

  @Column({ type: 'timestamp', nullable: true })
  resolved_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

/**
 * ViolationStatistics Entity (Optional but recommended)
 * Cached statistics for performance (dashboard queries)
 */
@Entity('violation_statistics')
@Index(['student_id', 'tahun'], { unique: true })
@Index(['total_violations'])
export class ViolationStatistics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  student_id: number;

  @Column({ type: 'int' })
  tahun: number;

  @Column({ type: 'int', default: 0 })
  total_violations: number;

  @Column({ type: 'int', default: 0 })
  total_severity_score: number; // Sum of all severity scores

  @Column({ type: 'float', default: 0 })
  average_severity: number; // Average severity of violations

  @Column({ type: 'int', default: 0 })
  sp_count: number; // Total SP letters issued

  @Column({ type: 'varchar', length: 50, default: 'green' })
  risk_level: string; // green (0-2), yellow (3-5), orange (6-8), red (9+)

  @Column({ type: 'text', nullable: true })
  most_common_violation: string; // Most frequent violation type

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
