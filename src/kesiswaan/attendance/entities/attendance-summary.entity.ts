import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('attendance_summaries')
@Index(['student_id', 'tahun_bulan'], { unique: true })
export class AttendanceSummary {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'bigint' })
  student_id: number;

  @Column({ type: 'bigint' })
  class_id: number;

  @Column({ type: 'varchar', length: 7 })
  tahun_bulan: string; // "2025-01"

  @Column({ type: 'int', default: 0 })
  total_hadir: number;

  @Column({ type: 'int', default: 0 })
  total_sakit: number;

  @Column({ type: 'int', default: 0 })
  total_izin: number;

  @Column({ type: 'int', default: 0 })
  total_alpa: number;

  @Column({ type: 'int' })
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
