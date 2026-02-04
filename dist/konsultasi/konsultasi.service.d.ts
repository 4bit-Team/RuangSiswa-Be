import { Repository } from 'typeorm';
import { CreateKonsultasiDto } from './dto/create-konsultasi.dto';
import { UpdateKonsultasiDto } from './dto/update-konsultasi.dto';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { Konsultasi } from './entities/konsultasi.entity';
import { KonsultasiAnswer } from './entities/konsultasi-answer.entity';
import { KonsultasiBookmark } from './entities/konsultasi-bookmark.entity';
import { ConsultationCategory } from '../consultation-category/entities/consultation-category.entity';
import { ToxicFilterService } from '../toxic-filter/toxic-filter.service';
export declare class KonsultasiService {
    private konsultasiRepository;
    private answerRepository;
    private bookmarkRepository;
    private categoryRepository;
    private toxicFilterService;
    constructor(konsultasiRepository: Repository<Konsultasi>, answerRepository: Repository<KonsultasiAnswer>, bookmarkRepository: Repository<KonsultasiBookmark>, categoryRepository: Repository<ConsultationCategory>, toxicFilterService: ToxicFilterService);
    findAll(options: {
        category?: string;
        sort: 'trending' | 'newest' | 'unanswered';
        page: number;
        limit: number;
        search?: string;
    }): Promise<{
        data: Konsultasi[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    findOneWithAnswers(id: string): Promise<{
        question: Konsultasi;
        answers: KonsultasiAnswer[];
    }>;
    findOneBySlug(slug: string): Promise<{
        question: Konsultasi;
        answers: KonsultasiAnswer[];
    }>;
    create(createKonsultasiDto: CreateKonsultasiDto, userId: string): Promise<Konsultasi>;
    update(id: string, updateKonsultasiDto: UpdateKonsultasiDto, userId: string): Promise<Konsultasi>;
    delete(id: string, userId: string): Promise<{
        message: string;
    }>;
    addAnswer(questionId: string, createAnswerDto: CreateAnswerDto, userId: string): Promise<KonsultasiAnswer>;
    voteQuestion(questionId: string, userId: string, vote: 1 | -1): Promise<{
        votes: number;
    }>;
    voteAnswer(questionId: string, answerId: string, userId: string, vote: 1 | -1): Promise<{
        votes: number;
        downvotes: number;
    }>;
    verifyAnswer(questionId: string, answerId: string, userId: string): Promise<KonsultasiAnswer>;
    applyToxicFilter(questionId: string): Promise<{
        question: {
            title: string;
            content: string;
            id: string;
            category: ConsultationCategory;
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
            answers: KonsultasiAnswer[];
            bookmarks: KonsultasiBookmark[];
            createdAt: Date;
            updatedAt: Date;
        };
        answers: {
            content: string;
            id: string;
            konsultasiId: string;
            konsultasi: Konsultasi;
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
        }[];
    }>;
    getStatistics(): Promise<{
        totalQuestions: number;
        answeredQuestions: number;
        unansweredQuestions: number;
        totalAnswers: number;
        totalViews: number;
        answerRate: string;
    }>;
    bookmarkQuestion(questionId: string, userId: string): Promise<KonsultasiBookmark>;
    removeBookmark(questionId: string, userId: string): Promise<{
        message: string;
    }>;
    getUserBookmarks(userId: string): Promise<{
        data: {
            bookmarkedAt: Date;
            id: string;
            title: string;
            content: string;
            category: ConsultationCategory;
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
            answers: KonsultasiAnswer[];
            bookmarks: KonsultasiBookmark[];
            createdAt: Date;
            updatedAt: Date;
        }[];
        total: number;
    }>;
    isBookmarked(questionId: string, userId: string): Promise<{
        isBookmarked: boolean;
    }>;
}
