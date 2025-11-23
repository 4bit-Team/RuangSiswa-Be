import { StudentCard } from '../../student-card/entities/student-card.entity';
import { Kelas } from '../../kelas/entities/kelas.entity';
import { Jurusan } from '../../jurusan/entities/jurusan.entity';
import { Conversation } from '../../chat/entities/conversation.entity';
import { Message } from '../../chat/entities/message.entity';
import { Call } from '../../chat/entities/call.entity';
export type UserRole = 'kesiswaan' | 'siswa' | 'admin' | 'bk';
export type UserStatus = 'aktif' | 'nonaktif';
export declare class User {
    id: number;
    username: string;
    fullName: string;
    email: string;
    password: string;
    role: UserRole;
    status: UserStatus;
    specialty: string;
    kartu_pelajar_file: string;
    kelas: Kelas;
    jurusan: Jurusan;
    studentCards: StudentCard[];
    sentConversations: Conversation[];
    receivedConversations: Conversation[];
    sentMessages: Message[];
    receivedMessages: Message[];
    initiatedCalls: Call[];
    receivedCalls: Call[];
}
