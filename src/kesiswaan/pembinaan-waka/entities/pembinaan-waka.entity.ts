import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Reservasi } from '../../../reservasi/entities/reservasi.entity';
import { Pembinaan } from '../../pembinaan/entities/pembinaan.entity';
import { User } from '../../../users/entities/user.entity';

export type WakDecision = 'sp3' | 'do';
export type PembinaanWakaStatus = 'pending' | 'in_review' | 'decided' | 'executed' | 'appealed';

@Entity('pembinaan_waka')
@Index(['reservasi_id'])
@Index(['pembinaan_id'])
@Index(['waka_id'])
export class PembinaanWaka {
  @PrimaryGeneratedColumn()
  id: number;

  // Relation to Reservasi (berat type only)
  @OneToOne(() => Reservasi, reservasi => reservasi.pembinaanWaka, { nullable: false })
  @JoinColumn({ name: 'reservasi_id' })
  reservasi: Reservasi;

  @Column()
  reservasi_id: number;

  // Relation to Pembinaan (for reference)
  @ManyToOne(() => Pembinaan, { nullable: false })
  @JoinColumn({ name: 'pembinaan_id' })
  pembinaan: Pembinaan;

  @Column()
  pembinaan_id: number;

  // WAKA who will decide
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'waka_id' })
  waka: User;

  @Column()
  waka_id: number;

  // Status tracking
  @Column({ type: 'enum', enum: ['pending', 'in_review', 'decided', 'executed', 'appealed'], default: 'pending' })
  status: PembinaanWakaStatus;

  // WAKA Decision - SP3 or DO (Dropout)
  @Column({ type: 'enum', enum: ['sp3', 'do'], nullable: true })
  wak_decision: WakDecision | null;

  // Decision details
  @Column({ type: 'text', nullable: true })
  decision_reason: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  // Timeline
  @Column({ type: 'timestamp', nullable: true })
  decision_date: Date | null;

  // Student impact
  @Column({ type: 'text', nullable: true })
  student_response: string | null;

  @Column({ default: false })
  student_acknowledged: boolean;

  // Parent notification
  @Column({ default: false })
  parent_notified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  parent_notification_date: Date | null;

  // Follow-up & Appeal
  @Column({ default: false })
  has_appeal: boolean;

  @Column({ type: 'text', nullable: true })
  appeal_reason: string | null;

  @Column({ type: 'timestamp', nullable: true })
  appeal_date: Date | null;

  @Column({ type: 'enum', enum: ['sp3', 'do'], nullable: true })
  appeal_decision: WakDecision | null;

  // Metadata
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true })
  created_by: number; // User who submitted to WAKA

  @Column({ nullable: true })
  updated_by: number; // User who last updated
}
