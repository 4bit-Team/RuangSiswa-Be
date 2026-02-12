import { User } from '../../users/entities/user.entity';
import { KonsultasiAnswer } from './konsultasi-answer.entity';
import { KonsultasiBookmark } from './konsultasi-bookmark.entity';
import { ConsultationCategory } from '../../consultation-category/entities/consultation-category.entity';
export declare class Konsultasi {
    id: string;
    title: string;
    content: string;
    category: ConsultationCategory;
    categoryId: number;
    authorId: string;
    author: User;
    tags: string[];
    views: number;
    votes: number;
    voters: Array<{
        userId: string;
        vote: 1 | -1;
    }>;
    answerCount: number;
    bookmarkCount: number;
    isResolved: boolean;
    answers: KonsultasiAnswer[];
    bookmarks: KonsultasiBookmark[];
    createdAt: Date;
    updatedAt: Date;
}
