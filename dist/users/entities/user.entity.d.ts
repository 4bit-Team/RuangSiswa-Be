import { StudentCard } from '../../student-card/entities/student-card.entity';
export type UserRole = 'kesiswaan' | 'siswa' | 'admin' | 'bk';
export type UserStatus = 'aktif' | 'nonaktif';
export declare class User {
    id: number;
    username: string;
    email: string;
    password: string;
    role: UserRole;
    status: UserStatus;
    kartu_pelajar_file: string;
    studentCards: StudentCard[];
}
