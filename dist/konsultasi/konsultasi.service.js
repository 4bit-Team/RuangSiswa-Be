"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KonsultasiService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const konsultasi_entity_1 = require("./entities/konsultasi.entity");
const konsultasi_answer_entity_1 = require("./entities/konsultasi-answer.entity");
const konsultasi_answer_reply_entity_1 = require("./entities/konsultasi-answer-reply.entity");
const konsultasi_bookmark_entity_1 = require("./entities/konsultasi-bookmark.entity");
const consultation_category_entity_1 = require("../consultation-category/entities/consultation-category.entity");
const toxic_filter_service_1 = require("../toxic-filter/toxic-filter.service");
const user_entity_1 = require("../users/entities/user.entity");
let KonsultasiService = class KonsultasiService {
    konsultasiRepository;
    answerRepository;
    replyRepository;
    bookmarkRepository;
    categoryRepository;
    userRepository;
    toxicFilterService;
    constructor(konsultasiRepository, answerRepository, replyRepository, bookmarkRepository, categoryRepository, userRepository, toxicFilterService) {
        this.konsultasiRepository = konsultasiRepository;
        this.answerRepository = answerRepository;
        this.replyRepository = replyRepository;
        this.bookmarkRepository = bookmarkRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.toxicFilterService = toxicFilterService;
    }
    async findAll(options) {
        const { category, sort, page, limit, search } = options;
        const skip = (page - 1) * limit;
        let query = this.konsultasiRepository
            .createQueryBuilder('k')
            .leftJoinAndSelect('k.author', 'author')
            .leftJoinAndSelect('k.category', 'category');
        if (category && category !== 'all') {
            const categoryId = parseInt(category, 10);
            if (!isNaN(categoryId)) {
                query = query.where('k.categoryId = :categoryId', { categoryId });
            }
        }
        if (search) {
            query = query.andWhere('(k.title ILIKE :search OR k.content ILIKE :search)', { search: `%${search}%` });
        }
        switch (sort) {
            case 'trending':
                query = query.orderBy('k.views', 'DESC').addOrderBy('k.votes', 'DESC');
                break;
            case 'unanswered':
                query = query.where('k.answerCount = 0').orderBy('k.createdAt', 'DESC');
                break;
            case 'newest':
            default:
                query = query.orderBy('k.createdAt', 'DESC');
        }
        const total = await query.getCount();
        const questions = await query.skip(skip).take(limit).getMany();
        return {
            data: questions,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    async findOneWithAnswers(id) {
        const question = await this.konsultasiRepository.findOne({
            where: { id },
            relations: ['author', 'category', 'answers', 'answers.author', 'answers.replies', 'answers.replies.author'],
        });
        if (!question) {
            throw new common_1.NotFoundException('Pertanyaan tidak ditemukan');
        }
        question.views += 1;
        await this.konsultasiRepository.save(question);
        question.answers = question.answers.sort((a, b) => b.votes - a.votes || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        question.answers.forEach(answer => {
            if (answer.replies) {
                answer.replies.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            }
        });
        return {
            question,
            answers: question.answers,
        };
    }
    normalizeSlug(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    async findOneBySlug(slug) {
        const normalizedSlug = this.normalizeSlug(slug);
        const questions = await this.konsultasiRepository
            .createQueryBuilder('k')
            .leftJoinAndSelect('k.author', 'author')
            .leftJoinAndSelect('k.category', 'category')
            .leftJoinAndSelect('k.answers', 'answers')
            .leftJoinAndSelect('answers.author', 'answer_author')
            .leftJoinAndSelect('answers.replies', 'replies')
            .leftJoinAndSelect('replies.author', 'replies_author')
            .orderBy('k.createdAt', 'DESC')
            .getMany();
        let question = questions.find(q => {
            const titleSlug = this.normalizeSlug(q.title);
            return titleSlug === normalizedSlug;
        });
        if (!question) {
            const slugWords = normalizedSlug.split('-').filter(w => w.length > 0);
            question = questions.find(q => {
                const titleLower = q.title.toLowerCase();
                return slugWords.every(word => titleLower.includes(word));
            });
        }
        if (!question) {
            throw new common_1.NotFoundException('Pertanyaan tidak ditemukan');
        }
        question.views += 1;
        await this.konsultasiRepository.save(question);
        question.answers = question.answers.sort((a, b) => b.votes - a.votes || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        question.answers.forEach(answer => {
            if (answer.replies) {
                answer.replies.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            }
        });
        return {
            question,
            answers: question.answers,
        };
    }
    async create(createKonsultasiDto, userId) {
        const toxicResult = await this.toxicFilterService.detectToxic(createKonsultasiDto.title + ' ' + createKonsultasiDto.content);
        if (toxicResult.hasSevere) {
            throw new common_1.BadRequestException('Konten mengandung kata-kata yang tidak sesuai');
        }
        let category = null;
        if (createKonsultasiDto.categoryId) {
            category = await this.categoryRepository.findOne({
                where: { id: Number(createKonsultasiDto.categoryId) },
            });
            if (!category) {
                throw new common_1.BadRequestException('Kategori tidak ditemukan');
            }
        }
        const question = this.konsultasiRepository.create({
            title: createKonsultasiDto.title,
            content: createKonsultasiDto.content,
            authorId: userId,
            categoryId: createKonsultasiDto.categoryId,
            ...(category && { category }),
            views: 0,
            votes: 0,
            answerCount: 0,
        });
        return await this.konsultasiRepository.save(question);
    }
    async update(id, updateKonsultasiDto, userId) {
        const question = await this.konsultasiRepository.findOne({
            where: { id },
        });
        if (!question) {
            throw new common_1.NotFoundException('Pertanyaan tidak ditemukan');
        }
        if (question.authorId !== userId) {
            throw new common_1.ForbiddenException('Anda tidak memiliki akses untuk mengubah pertanyaan ini');
        }
        if (updateKonsultasiDto.title || updateKonsultasiDto.content) {
            const textToCheck = (updateKonsultasiDto.title || question.title) +
                ' ' +
                (updateKonsultasiDto.content || question.content);
            const toxicResult = await this.toxicFilterService.detectToxic(textToCheck);
            if (toxicResult.hasSevere) {
                throw new common_1.BadRequestException('Konten mengandung kata-kata yang tidak sesuai');
            }
        }
        if (updateKonsultasiDto.categoryId) {
            const category = await this.categoryRepository.findOne({
                where: { id: Number(updateKonsultasiDto.categoryId) },
            });
            if (!category) {
                throw new common_1.BadRequestException('Kategori tidak ditemukan');
            }
            question.categoryId = updateKonsultasiDto.categoryId;
            question.category = category;
        }
        if (updateKonsultasiDto.title)
            question.title = updateKonsultasiDto.title;
        if (updateKonsultasiDto.content)
            question.content = updateKonsultasiDto.content;
        return await this.konsultasiRepository.save(question);
    }
    async delete(id, userId) {
        const question = await this.konsultasiRepository.findOne({
            where: { id },
        });
        if (!question) {
            throw new common_1.NotFoundException('Pertanyaan tidak ditemukan');
        }
        if (question.authorId !== userId) {
            throw new common_1.ForbiddenException('Anda tidak memiliki akses untuk menghapus pertanyaan ini');
        }
        await this.answerRepository.delete({ konsultasiId: id });
        await this.konsultasiRepository.delete(id);
        return { message: 'Pertanyaan berhasil dihapus' };
    }
    async addAnswer(questionId, createAnswerDto, userId) {
        const question = await this.konsultasiRepository.findOne({
            where: { id: questionId },
        });
        if (!question) {
            throw new common_1.NotFoundException('Pertanyaan tidak ditemukan');
        }
        const toxicResult = await this.toxicFilterService.detectToxic(createAnswerDto.content);
        if (toxicResult.hasSevere) {
            throw new common_1.BadRequestException('Konten mengandung kata-kata yang tidak sesuai');
        }
        const answer = this.answerRepository.create({
            konsultasiId: questionId,
            authorId: userId,
            content: createAnswerDto.content,
            attachment: createAnswerDto.attachment,
            votes: 0,
            isVerified: false,
        });
        const savedAnswer = await this.answerRepository.save(answer);
        question.answerCount += 1;
        await this.konsultasiRepository.save(question);
        return savedAnswer;
    }
    async voteQuestion(questionId, userId, vote) {
        const question = await this.konsultasiRepository.findOne({
            where: { id: questionId },
        });
        if (!question) {
            throw new common_1.NotFoundException('Pertanyaan tidak ditemukan');
        }
        const voters = question.voters;
        const existingVote = voters.find(v => v.userId === userId);
        if (existingVote) {
            if (existingVote.vote === vote) {
                question.votes -= vote;
                question.voters = voters.filter(v => v.userId !== userId);
            }
            else {
                question.votes -= existingVote.vote;
                question.votes += vote;
                existingVote.vote = vote;
            }
        }
        else {
            question.votes += vote;
            voters.push({ userId, vote });
            question.voters = voters;
        }
        await this.konsultasiRepository.save(question);
        return { votes: question.votes };
    }
    async voteAnswer(questionId, answerId, userId, vote) {
        const answer = await this.answerRepository.findOne({
            where: { id: answerId },
        });
        if (!answer) {
            throw new common_1.NotFoundException('Jawaban tidak ditemukan');
        }
        const voters = answer.voters;
        const existingVote = voters.find(v => v.userId === userId);
        if (existingVote) {
            if (existingVote.vote === vote) {
                if (vote === 1) {
                    answer.votes--;
                }
                else {
                    answer.downvotes--;
                }
                answer.voters = voters.filter(v => v.userId !== userId);
            }
            else {
                if (existingVote.vote === 1) {
                    answer.votes--;
                }
                else {
                    answer.downvotes--;
                }
                if (vote === 1) {
                    answer.votes++;
                }
                else {
                    answer.downvotes++;
                }
                existingVote.vote = vote;
            }
        }
        else {
            if (vote === 1) {
                answer.votes++;
            }
            else {
                answer.downvotes++;
            }
            voters.push({ userId, vote });
            answer.voters = voters;
        }
        await this.answerRepository.save(answer);
        return { votes: answer.votes, downvotes: answer.downvotes };
    }
    async verifyAnswer(questionId, answerId, userId) {
        const answer = await this.answerRepository.findOne({
            where: { id: answerId },
        });
        if (!answer) {
            throw new common_1.NotFoundException('Jawaban tidak ditemukan');
        }
        answer.isVerified = true;
        answer.verifiedBy = userId;
        answer.verifiedAt = new Date();
        return await this.answerRepository.save(answer);
    }
    async applyToxicFilter(questionId) {
        const question = await this.konsultasiRepository.findOne({
            where: { id: questionId },
            relations: ['answers'],
        });
        if (!question) {
            throw new common_1.NotFoundException('Pertanyaan tidak ditemukan');
        }
        const filteredTitle = await this.toxicFilterService.filterText(question.title);
        const filteredContent = await this.toxicFilterService.filterText(question.content);
        const filteredAnswers = await Promise.all(question.answers.map(async (answer) => ({
            ...answer,
            content: await this.toxicFilterService.filterText(answer.content),
        })));
        return {
            question: {
                ...question,
                title: filteredTitle,
                content: filteredContent,
            },
            answers: filteredAnswers,
        };
    }
    async getStatistics() {
        const totalQuestions = await this.konsultasiRepository.count();
        const answeredQuestions = await this.konsultasiRepository.count({
            where: { answerCount: (0, typeorm_2.MoreThan)(0) },
        });
        const totalAnswers = await this.answerRepository.count();
        const totalViews = (await this.konsultasiRepository.find()).reduce((sum, q) => sum + q.views, 0);
        return {
            totalQuestions,
            answeredQuestions,
            unansweredQuestions: totalQuestions - answeredQuestions,
            totalAnswers,
            totalViews,
            answerRate: ((answeredQuestions / (totalQuestions || 1)) * 100).toFixed(2) + '%',
        };
    }
    async bookmarkQuestion(questionId, userId) {
        const question = await this.konsultasiRepository.findOne({
            where: { id: questionId },
        });
        if (!question) {
            throw new common_1.NotFoundException('Pertanyaan tidak ditemukan');
        }
        const existingBookmark = await this.bookmarkRepository.findOne({
            where: { konsultasiId: questionId, userId },
        });
        if (existingBookmark) {
            throw new common_1.BadRequestException('Pertanyaan sudah di-bookmark');
        }
        const bookmark = this.bookmarkRepository.create({
            konsultasiId: questionId,
            userId,
        });
        await this.bookmarkRepository.save(bookmark);
        question.bookmarkCount = (question.bookmarkCount || 0) + 1;
        await this.konsultasiRepository.save(question);
        return bookmark;
    }
    async removeBookmark(questionId, userId) {
        const result = await this.bookmarkRepository.delete({
            konsultasiId: questionId,
            userId,
        });
        if (result.affected === 0) {
            throw new common_1.NotFoundException('Bookmark tidak ditemukan');
        }
        const question = await this.konsultasiRepository.findOne({
            where: { id: questionId },
        });
        if (question) {
            question.bookmarkCount = Math.max(0, (question.bookmarkCount || 0) - 1);
            await this.konsultasiRepository.save(question);
        }
        return { message: 'Bookmark berhasil dihapus' };
    }
    async getUserBookmarks(userId) {
        const bookmarks = await this.bookmarkRepository.find({
            where: { userId },
            relations: ['konsultasi', 'konsultasi.author', 'konsultasi.category'],
            order: { createdAt: 'DESC' },
        });
        return {
            data: bookmarks.map(b => ({
                ...b.konsultasi,
                bookmarkedAt: b.createdAt,
            })),
            total: bookmarks.length,
        };
    }
    async getUserAnswers(userId) {
        const answers = await this.answerRepository.find({
            where: { authorId: userId },
            relations: ['konsultasi', 'author'],
            order: { createdAt: 'DESC' },
        });
        return {
            data: answers,
            total: answers.length,
        };
    }
    async isBookmarked(questionId, userId) {
        const bookmark = await this.bookmarkRepository.findOne({
            where: { konsultasiId: questionId, userId },
        });
        return {
            isBookmarked: !!bookmark,
        };
    }
    async createReply(questionId, answerId, createReplyDto, userId) {
        const question = await this.konsultasiRepository.findOne({
            where: { id: questionId },
        });
        if (!question) {
            throw new common_1.NotFoundException('Pertanyaan tidak ditemukan');
        }
        const answer = await this.answerRepository.findOne({
            where: { id: answerId, konsultasiId: questionId },
        });
        if (!answer) {
            throw new common_1.NotFoundException('Jawaban tidak ditemukan');
        }
        const user = await this.userRepository.findOne({
            where: { id: Number(userId) },
        });
        if (!user) {
            throw new common_1.NotFoundException('User tidak ditemukan');
        }
        const reply = this.replyRepository.create({
            answerId,
            authorId: Number(userId),
            content: createReplyDto.content,
        });
        const savedReply = await this.replyRepository.save(reply);
        savedReply.author = user;
        return {
            id: savedReply.id,
            content: savedReply.content,
            authorId: savedReply.authorId,
            votes: savedReply.votes,
            downvotes: savedReply.downvotes,
            isVerified: savedReply.isVerified,
            createdAt: savedReply.createdAt,
            updatedAt: savedReply.updatedAt,
        };
    }
    async voteReply(questionId, answerId, replyId, userId, vote) {
        const reply = await this.replyRepository.findOne({
            where: { id: replyId, answerId },
        });
        if (!reply) {
            throw new common_1.NotFoundException('Balasan tidak ditemukan');
        }
        const numUserId = Number(userId);
        const voters = reply.voters;
        const existingVote = voters.find(v => v.userId === numUserId);
        if (existingVote) {
            if (existingVote.vote === vote) {
                if (vote === 1) {
                    reply.votes--;
                }
                else {
                    reply.downvotes--;
                }
                reply.voters = voters.filter(v => v.userId !== numUserId);
            }
            else {
                if (existingVote.vote === 1) {
                    reply.votes--;
                }
                else {
                    reply.downvotes--;
                }
                if (vote === 1) {
                    reply.votes++;
                }
                else {
                    reply.downvotes++;
                }
                existingVote.vote = vote;
            }
        }
        else {
            if (vote === 1) {
                reply.votes++;
            }
            else {
                reply.downvotes++;
            }
            voters.push({ userId: numUserId, vote });
            reply.voters = voters;
        }
        await this.replyRepository.save(reply);
        return { votes: reply.votes, downvotes: reply.downvotes };
    }
};
exports.KonsultasiService = KonsultasiService;
exports.KonsultasiService = KonsultasiService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(konsultasi_entity_1.Konsultasi)),
    __param(1, (0, typeorm_1.InjectRepository)(konsultasi_answer_entity_1.KonsultasiAnswer)),
    __param(2, (0, typeorm_1.InjectRepository)(konsultasi_answer_reply_entity_1.KonsultasiAnswerReply)),
    __param(3, (0, typeorm_1.InjectRepository)(konsultasi_bookmark_entity_1.KonsultasiBookmark)),
    __param(4, (0, typeorm_1.InjectRepository)(consultation_category_entity_1.ConsultationCategory)),
    __param(5, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        toxic_filter_service_1.ToxicFilterService])
], KonsultasiService);
//# sourceMappingURL=konsultasi.service.js.map