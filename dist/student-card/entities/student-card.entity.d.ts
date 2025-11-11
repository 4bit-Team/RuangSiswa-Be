import { User } from '../../users/entities/user.entity';
export declare class StudentCard {
    id: number;
    user: User;
    file_path: string;
    extracted_data?: {
        nama?: string;
        nis?: string;
        ttl?: string;
        gender?: string;
        kelas?: string;
        jurusan?: string;
        [key: string]: any;
    };
    kelas?: string;
    jurusan?: string;
    upload_date: Date;
}
