import { User } from '../../users/entities/user.entity';
import { KonsultasiAnswer } from './konsultasi-answer.entity';
export declare class KonsultasiAnswerReply {
    id: string;
    answerId: string;
    answer: KonsultasiAnswer;
    authorId: number;
    author: User;
    content: string;
    votes: number;
    downvotes: number;
    voters: Array<{
        userId: number;
        vote: 1 | -1;
    }>;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}
