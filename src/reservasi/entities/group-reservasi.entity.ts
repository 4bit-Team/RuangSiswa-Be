import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CounselingCategory } from '../../counseling-category/entities/counseling-category.entity';

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

  @Column({ default: 'chat' })
  type: 'chat' | 'tatap-muka';

  @ManyToOne(() => CounselingCategory, { eager: true })
  @JoinColumn({ name: 'topicId' })
  topic: CounselingCategory;

  @Column({ nullable: true })
  topicId: number;

  @Column({ nullable: true })
  notes: string;

  @Column({ default: 'pending' })
  status: 'pending' | 'approved' | 'rejected' | 'in_counseling' | 'completed' | 'cancelled';

  @Column({ nullable: true })
  conversationId: number;

  @Column({ nullable: true })
  rejectionReason: string;

  @Column({ nullable: true })
  room: string;

  @Column({ nullable: true })
  qrCode: string;

  @Column({ default: false })
  attendanceConfirmed: boolean;

  @Column({ nullable: true })
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
