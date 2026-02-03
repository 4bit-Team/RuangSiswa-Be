import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Message } from './message.entity';

@Entity('conversations')
@Index('IDX_conversations_sender_receiver', ['senderId', 'receiverId'])
@Index('IDX_conversations_receiver_sender', ['receiverId', 'senderId'])
@Index('IDX_conversations_sender_active', ['senderId', 'isActive'])
@Index('IDX_conversations_receiver_active', ['receiverId', 'isActive'])
@Unique('UQ_conversations_pair', ['senderIdMin', 'senderIdMax'])
export class Conversation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  senderId: number;

  @Column()
  receiverId: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  subject: string;

  @Column({ nullable: true })
  lastMessageId: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastMessageAt: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ default: 'active' })
  status: 'active' | 'in_counseling' | 'completed'; // Track session status

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Denormalized fields untuk unique constraint
  @Column({ nullable: true })
  senderIdMin: number;

  @Column({ nullable: true })
  senderIdMax: number;

  // Relations
  @ManyToOne(() => User, (user) => user.sentConversations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @ManyToOne(() => User, (user) => user.receivedConversations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'receiverId' })
  receiver: User;

  @OneToMany(() => Message, (message) => message.conversation, {
    cascade: true,
  })
  messages: Message[];
}
