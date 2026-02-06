import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('attendance_records')
@Index(['student_id', 'tanggal'], { unique: true })
@Index(['student_id', 'tanggal'])
@Index(['class_id', 'tanggal'])
export class AttendanceRecord {
  @PrimaryGeneratedColumn({ type: 'bigint' })
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
