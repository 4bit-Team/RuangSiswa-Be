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
        [key: string]: any;
    };
    upload_date: Date;
}
