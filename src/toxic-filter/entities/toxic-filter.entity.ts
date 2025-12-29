import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('toxic_filters')
export class ToxicFilter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  word: string; // The word/phrase to filter

  @Column({ type: 'varchar', length: 20, default: 'medium' })
  severity: 'low' | 'medium' | 'high'; // Severity level

  @Column({ type: 'varchar', length: 100, default: '***' })
  replacement: string; // Replacement text (e.g., ***)

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  description: string; // Description of why it's toxic

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
