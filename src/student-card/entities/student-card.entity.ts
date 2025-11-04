import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('student_card')
export class StudentCard {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.studentCards, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  file_path: string;

  @Column({ type: 'json', nullable: true })
  extracted_data?: {
    nama?: string;
    nis?: string;
    ttl?: string;
    gender?: string;
    kelas?: string;
    [key: string]: any;
  };

  @CreateDateColumn()
  upload_date: Date;
}
