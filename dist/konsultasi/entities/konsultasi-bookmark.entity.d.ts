import { User } from '../../users/entities/user.entity';
import { Konsultasi } from './konsultasi.entity';
export declare class KonsultasiBookmark {
    id: string;
    userId: string;
    user: User;
    konsultasiId: string;
    konsultasi: Konsultasi;
    createdAt: Date;
}
