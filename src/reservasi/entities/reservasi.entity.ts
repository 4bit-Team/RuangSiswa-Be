import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('reservasi')
export class Reservasi {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  studentId: number;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'studentId' })
  student: User;

  @Column()
  counselorId: number;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'counselorId' })
  counselor: User;

  @Column()
  preferredDate: Date;

  @Column()
  preferredTime: string; // Format: HH:MM

  @Column({ default: 'chat' })
  type: 'chat' | 'tatap-muka'; // Tipe sesi

  @Column({ nullable: true })
  topic: string; // akademik, karir, sosial, keluarga, dll

  @Column({ nullable: true })
  notes: string; // Catatan dari siswa

  @Column({ default: 'pending' })
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';

  @Column({ nullable: true })
  conversationId: number; // Referensi ke conversation yang dibuat saat approved

  @Column({ nullable: true })
  rejectionReason: string; // Alasan jika ditolak

  @Column({ nullable: true })
  room: string; // Ruang untuk tatap muka

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
