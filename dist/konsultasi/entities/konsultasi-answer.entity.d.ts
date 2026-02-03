import { User } from '../../users/entities/user.entity';
import { Konsultasi } from './konsultasi.entity';
export declare class KonsultasiAnswer {
    id: string;
    konsultasiId: string;
    konsultasi: Konsultasi;
    authorId: string;
    author: User;
    content: string;
    votes: number;
    downvotes: number;
    voters: Array<{
        userId: string;
        vote: 1 | -1;
    }>;
    isVerified: boolean;
    verifiedBy: string | null;
    verifiedAt: Date | null;
    attachment: string | null;
    createdAt: Date;
    updatedAt: Date;
}
