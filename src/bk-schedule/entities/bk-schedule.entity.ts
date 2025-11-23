import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export type SessionType = 'tatap-muka' | 'chat';

@Entity('bk_schedule')
@Index(['bkId', 'sessionType'], { unique: true, where: '"sessionType" IS NOT NULL' })
export class BkSchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  bkId: number; // Reference ke user dengan role 'bk'

  @Column({ type: 'enum', enum: ['tatap-muka', 'chat'], nullable: false, default: 'tatap-muka' })
  sessionType: SessionType; // Tipe sesi yang dijadwalkan

  @Column({ type: 'time' })
  startTime: string; // Format: HH:MM (e.g., "08:00")

  @Column({ type: 'time' })
  endTime: string; // Format: HH:MM (e.g., "16:00")

  @Column({ type: 'simple-array' })
  availableDays: string[]; // ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
