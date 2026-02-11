import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CounselingCategory } from '../../counseling-category/entities/counseling-category.entity';
import { ReservasiStatus } from '../enums/reservasi-status.enum';
import { SessionType } from '../enums/session-type.enum';

@Entity('group_reservasi')
export class GroupReservasi {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  groupName: string; // Nama grup konseling

  @Column()
  creatorId: number; // Siswa yang membuat grup

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  // Daftar siswa dalam grup (many-to-many)
  @ManyToMany(() => User)
  @JoinTable({
    name: 'group_reservasi_students',
    joinColumn: { name: 'groupReservasiId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'studentId', referencedColumnName: 'id' },
  })
  students: User[];

  @Column()
  counselorId: number;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'counselorId' })
  counselor: User;

  @Column()
  preferredDate: Date;

  @Column()
  preferredTime: string; // Format: HH:MM

  @Column({ enum: SessionType, default: SessionType.CHAT })
  type: SessionType;

  @ManyToOne(() => CounselingCategory, { eager: true })
  @JoinColumn({ name: 'topicId' })
  topic: CounselingCategory;

  @Column({ nullable: true })
  topicId: number;

  @Column({ nullable: true })
  notes: string;

  @Column({ enum: ReservasiStatus, default: ReservasiStatus.PENDING })
  status: ReservasiStatus;

  @Column({ nullable: true })
  conversationId: number;

  @Column({ nullable: true })
  rejectionReason: string;

  @Column({ nullable: true })
  room: string;

  @Column({ nullable: true })
  qrCode: string;

  @Column({ nullable: true })
  qrGeneratedAt: Date; // Waktu QR di-generate (15 menit sebelum sesi)

  @Column({ default: false })
  attendanceConfirmed: boolean;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ nullable: true })
  chatInitializedAt: Date; // Waktu chat di-initialize (15 menit sebelum sesi)

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
