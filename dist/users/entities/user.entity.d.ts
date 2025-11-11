import { StudentCard } from '../../student-card/entities/student-card.entity';
import { Kelas } from '../../kelas/entities/kelas.entity';
import { Jurusan } from '../../jurusan/entities/jurusan.entity';
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
    kelas: Kelas;
    jurusan: Jurusan;
    studentCards: StudentCard[];
}
