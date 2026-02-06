import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('attendance_records')
@Index(['student_id', 'tanggal'], { unique: true })
@Index(['student_id', 'tanggal'])
@Index(['class_id', 'tanggal'])
export class AttendanceRecord {
  @PrimaryGeneratedColumn('bigint')
  id: number;

  @Column({ type: 'bigint' })
  student_id: number;

  @Column({ type: 'varchar', length: 255 })
  student_name: string;

  @Column({ type: 'bigint' })
  class_id: number;

  @Column({ type: 'date' })
  tanggal: Date;

  @Column({ type: 'enum', enum: ['H', 'S', 'I', 'A'] })
  status: 'H' | 'S' | 'I' | 'A'; // Hadir, Sakit, Izin, Alpa

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'boolean', default: true })
  synced_from_walas: boolean;

  @Column({ type: 'timestamp', nullable: true })
  synced_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

@Entity('attendance_summaries')
@Index(['student_id', 'tahun_bulan'], { unique: true })
@Index(['student_id', 'tahun_bulan'])
export class AttendanceSummary {
  @PrimaryGeneratedColumn('bigint')
  id: number;

  @Column({ type: 'bigint' })
  student_id: number;

  @Column({ type: 'bigint' })
  class_id: number;

  @Column({ type: 'varchar', length: 7 })
  tahun_bulan: string; // "2025-01"

  @Column({ type: 'tinyint', default: 0 })
  total_hadir: number;

  @Column({ type: 'tinyint', default: 0 })
  total_sakit: number;

  @Column({ type: 'tinyint', default: 0 })
  total_izin: number;

  @Column({ type: 'tinyint', default: 0 })
  total_alpa: number;

  @Column({ type: 'tinyint' })
  total_days_expected: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  attendance_percentage: number;

  @Column({ type: 'boolean', default: false })
  is_flagged: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reason_if_flagged: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

@Entity('attendance_alerts')
@Index(['student_id', 'alert_type'])
@Index(['is_resolved'])
export class AttendanceAlert {
  @PrimaryGeneratedColumn('bigint')
  id: number;

  @Column({ type: 'bigint' })
  student_id: number;

  @Column({ type: 'enum', enum: ['high_alpa', 'low_attendance', 'pattern_change'] })
  alert_type: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: ['warning', 'critical'], default: 'warning' })
  severity: string;

  @Column({ type: 'boolean', default: false })
  is_resolved: boolean;

  @Column({ type: 'bigint', nullable: true })
  resolved_by: number; // user_id

  @Column({ type: 'timestamp', nullable: true })
  resolved_at: Date;

  @CreateDateColumn()
  created_at: Date;
}
