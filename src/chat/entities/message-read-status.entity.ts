import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Message } from './message.entity';

@Entity('message_read_status')
@Index('IDX_message_read_status_user_unread', ['userId', 'isRead'])
@Index('IDX_message_read_status_message', ['messageId'])
@Index('IDX_message_read_status_read_at', ['readAt'])
@Unique('UQ_message_read_per_user', ['messageId', 'userId'])
export class MessageReadStatus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  messageId: number;

  @Column()
  userId: number;

  @Column({ type: 'boolean', default: true })
  isDelivered: boolean;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @CreateDateColumn()
  deliveredAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Message, (message) => message.readStatuses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'messageId' })
  message: Message;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
