import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Check,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum CallStatus {
  INITIATED = 'initiated',
  RINGING = 'ringing',
  ACCEPTED = 'accepted',
  ACTIVE = 'active',
  ENDED = 'ended',
  REJECTED = 'rejected',
  MISSED = 'missed',
  FAILED = 'failed',
}

export enum CallType {
  AUDIO = 'audio',
  VIDEO = 'video',
}

@Entity('calls')
@Index(['callerId', 'status'])
@Index(['receiverId', 'status'])
@Index(['conversationId', 'createdAt'])
@Index(['status', 'createdAt'])
@Check(`"caller_id" != "receiver_id"`)
export class Call {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  conversationId: number;

  @Column({ type: 'enum', enum: CallType })
  callType: CallType; // 'audio' atau 'video'

  @Column({ type: 'enum', enum: CallStatus, default: CallStatus.INITIATED })
  status: CallStatus;

  @Column()
  callerId: number; // Yang menelpon

  @ManyToOne(() => User, (user) => user.initiatedCalls, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'caller_id' })
  caller: User;

  @Column()
  receiverId: number; // Yang menerima panggilan

  @ManyToOne(() => User, (user) => user.receivedCalls, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'receiver_id' })
  receiver: User;

  @Column({ type: 'timestamp', nullable: true })
  ringingStartedAt: Date; 

  @Column({ type: 'timestamp', nullable: true })
  acceptedAt: Date; 

  @Column({ type: 'timestamp', nullable: true })
  endedAt: Date; 

  @Column({ type: 'int', nullable: true })
  duration: number;

  @Column({ type: 'varchar', nullable: true })
  rejectionReason: string;
  @Column({ type: 'simple-array', nullable: true })
  iceCandidates: string[];

  @Column({ type: 'text', nullable: true })
  callerOffer: string;

  @Column({ type: 'text', nullable: true })
  receiverAnswer: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
