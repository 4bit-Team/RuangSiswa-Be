import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';
import { StudentCard } from '../../student-card/entities/student-card.entity';
import { Kelas } from '../../kelas/entities/kelas.entity';
import { Jurusan } from '../../jurusan/entities/jurusan.entity';
import { Conversation } from '../../chat/entities/conversation.entity';
import { Message } from '../../chat/entities/message.entity';
import { Call } from '../../chat/entities/call.entity';
import { News } from '../../news/entities/news.entity';

export type UserRole = 'kesiswaan' | 'siswa' | 'admin' | 'bk';
export type UserStatus = 'aktif' | 'nonaktif';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ nullable: true })
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: ['kesiswaan', 'siswa', 'admin', 'bk'], default: 'siswa' })
  role: UserRole;

  @Column({ type: 'enum', enum: ['aktif', 'nonaktif'], default: 'aktif' })
  status: UserStatus;

  @Column({ nullable: true })
  specialty: string;

  @Column({ nullable: true })
  kartu_pelajar_file: string;

  @Column({ nullable: true })
  phone_number: string;

  @Column({ nullable: true })
  kelas_lengkap: string;

  @ManyToOne(() => Kelas, kelas => kelas.users, { nullable: true })
  kelas: Kelas;

  @ManyToOne(() => Jurusan, jurusan => jurusan.users, { nullable: true })
  jurusan: Jurusan;

  @OneToMany(() => StudentCard, card => card.user)
  studentCards: StudentCard[];

  // Chat Relations
  @OneToMany(() => Conversation, conversation => conversation.sender)
  sentConversations: Conversation[];

  @OneToMany(() => Conversation, conversation => conversation.receiver)
  receivedConversations: Conversation[];

  @OneToMany(() => Message, message => message.sender)
  sentMessages: Message[];

  @OneToMany(() => Message, message => message.receiver)
  receivedMessages: Message[];

  // Call Relations
  @OneToMany(() => Call, call => call.caller)
  initiatedCalls: Call[];

  @OneToMany(() => Call, call => call.receiver)
  receivedCalls: Call[];

  // News Relations
  @OneToMany(() => News, news => news.author)
  newsArticles: News[];
}
