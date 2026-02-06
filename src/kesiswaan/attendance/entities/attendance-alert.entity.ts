import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('attendance_alerts')
@Index('idx_alert_student_type', ['student_id', 'alert_type'])
@Index('idx_alert_resolved', ['is_resolved'])
export class AttendanceAlert {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'bigint' })
  student_id: number;

  @Column({ type: 'enum', enum: ['high_alpa', 'low_attendance', 'pattern_change'] })
  alert_type: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ['critical', 'warning', 'info'] })
  severity: string;

  @Column({ type: 'boolean', default: false })
  is_resolved: boolean;

  @Column({ type: 'timestamp', nullable: true })
  resolved_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
