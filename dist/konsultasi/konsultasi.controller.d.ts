import { KonsultasiService } from './konsultasi.service';
import { CreateKonsultasiDto } from './dto/create-konsultasi.dto';
import { UpdateKonsultasiDto } from './dto/update-konsultasi.dto';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
export declare class KonsultasiController {
    private readonly konsultasiService;
    constructor(konsultasiService: KonsultasiService);
    getStatistics(): Promise<{
        totalQuestions: number;
        answeredQuestions: number;
        unansweredQuestions: number;
        totalAnswers: number;
        totalViews: number;
        answerRate: string;
    }>;
    getQuestionBySlug(slug: string): Promise<{
        question: import("./entities/konsultasi.entity").Konsultasi;
        answers: import("./entities/konsultasi-answer.entity").KonsultasiAnswer[];
    }>;
    getAllQuestions(category?: string, sort?: 'trending' | 'newest' | 'unanswered', page?: number, limit?: number, search?: string): Promise<{
        data: import("./entities/konsultasi.entity").Konsultasi[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getQuestionDetail(id: string): Promise<{
        question: import("./entities/konsultasi.entity").Konsultasi;
        answers: import("./entities/konsultasi-answer.entity").KonsultasiAnswer[];
    }>;
    createQuestion(createKonsultasiDto: CreateKonsultasiDto, req: any): Promise<import("./entities/konsultasi.entity").Konsultasi>;
    updateQuestion(id: string, updateKonsultasiDto: UpdateKonsultasiDto, req: any): Promise<import("./entities/konsultasi.entity").Konsultasi>;
    deleteQuestion(id: string, req: any): Promise<{
        message: string;
    }>;
    voteQuestion(id: string, { vote }: {
        vote: 1 | -1;
    }, req: any): Promise<{
        votes: number;
    }>;
    addAnswer(questionId: string, createAnswerDto: CreateAnswerDto, req: any): Promise<import("./entities/konsultasi-answer.entity").KonsultasiAnswer>;
    voteAnswer(questionId: string, answerId: string, { vote }: {
        vote: 1 | -1;
    }, req: any): Promise<{
        votes: number;
        downvotes: number;
    }>;
    createReply(questionId: string, answerId: string, createReplyDto: CreateReplyDto, req: any): Promise<{
        id: string;
        content: string;
        authorId: number;
        votes: number;
        downvotes: number;
        isVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    voteReply(questionId: string, answerId: string, replyId: string, { vote }: {
        vote: 1 | -1;
    }, req: any): Promise<{
        votes: number;
        downvotes: number;
    }>;
    verifyAnswer(questionId: string, answerId: string, req: any): Promise<import("./entities/konsultasi-answer.entity").KonsultasiAnswer>;
    filterToxic(id: string): Promise<{
        question: {
            title: string;
            content: string;
            id: string;
            category: import("../consultation-category/entities/consultation-category.entity").ConsultationCategory;
            categoryId: number;
            authorId: string;
            author: import("../users/entities/user.entity").User;
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
            answers: import("./entities/konsultasi-answer.entity").KonsultasiAnswer[];
            bookmarks: import("./entities/konsultasi-bookmark.entity").KonsultasiBookmark[];
            createdAt: Date;
            updatedAt: Date;
        };
        answers: {
            content: string;
            id: string;
            konsultasiId: string;
            konsultasi: import("./entities/konsultasi.entity").Konsultasi;
            authorId: string;
            author: import("../users/entities/user.entity").User;
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
            replies: any;
        }[];
    }>;
    bookmarkQuestion(questionId: string, req: any): Promise<import("./entities/konsultasi-bookmark.entity").KonsultasiBookmark>;
    removeBookmark(questionId: string, req: any): Promise<{
        message: string;
    }>;
    getUserBookmarks(req: any): Promise<{
        data: {
            bookmarkedAt: Date;
            id: string;
            title: string;
            content: string;
            category: import("../consultation-category/entities/consultation-category.entity").ConsultationCategory;
            categoryId: number;
            authorId: string;
            author: import("../users/entities/user.entity").User;
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
            answers: import("./entities/konsultasi-answer.entity").KonsultasiAnswer[];
            bookmarks: import("./entities/konsultasi-bookmark.entity").KonsultasiBookmark[];
            createdAt: Date;
            updatedAt: Date;
        }[];
        total: number;
    }>;
    isBookmarked(questionId: string, req: any): Promise<{
        isBookmarked: boolean;
    }>;
}
