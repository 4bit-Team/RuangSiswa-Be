import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export type SessionType = 'tatap-muka' | 'chat';

export interface DaySchedule {
  day: string; // 'Monday', 'Tuesday', etc.
  startTime: string; // Format: HH:MM (e.g., "08:00")
  endTime: string; // Format: HH:MM (e.g., "16:00")
  isActive: boolean;
}

@Entity('bk_schedule')
@Index(['bkId', 'sessionType'], { unique: true, where: '"sessionType" IS NOT NULL' })
export class BkSchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  bkId: number; // Reference ke user dengan role 'bk'

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'bkId' })
  bk: User;

  @Column({ type: 'enum', enum: ['tatap-muka', 'chat'], nullable: false, default: 'tatap-muka' })
  sessionType: SessionType; // Tipe sesi yang dijadwalkan

  @Column({ type: 'json', default: () => "'[]'" })
  daySchedules: DaySchedule[]; // Array of day schedules with specific times

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}