import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, In } from 'typeorm';
import { CreateKonsultasiDto } from './dto/create-konsultasi.dto';
import { UpdateKonsultasiDto } from './dto/update-konsultasi.dto';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { Konsultasi } from './entities/konsultasi.entity';
import { KonsultasiAnswer } from './entities/konsultasi-answer.entity';
import { KonsultasiAnswerReply } from './entities/konsultasi-answer-reply.entity';
import { KonsultasiBookmark } from './entities/konsultasi-bookmark.entity';
import { ConsultationCategory } from '../consultation-category/entities/consultation-category.entity';
import { ToxicFilterService } from '../toxic-filter/toxic-filter.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class KonsultasiService {
  constructor(
    @InjectRepository(Konsultasi)
    private konsultasiRepository: Repository<Konsultasi>,
    @InjectRepository(KonsultasiAnswer)
    private answerRepository: Repository<KonsultasiAnswer>,
    @InjectRepository(KonsultasiAnswerReply)
    private replyRepository: Repository<KonsultasiAnswerReply>,
    @InjectRepository(KonsultasiBookmark)
    private bookmarkRepository: Repository<KonsultasiBookmark>,
    @InjectRepository(ConsultationCategory)
    private categoryRepository: Repository<ConsultationCategory>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private toxicFilterService: ToxicFilterService,
  ) {}

  // Find all questions with filters and pagination
  async findAll(options: {
    category?: string;
    sort: 'trending' | 'newest' | 'unanswered';
    page: number;
    limit: number;
    search?: string;
  }) {
    const { category, sort, page, limit, search } = options;
    const skip = (page - 1) * limit;

    let query = this.konsultasiRepository
      .createQueryBuilder('k')
      .leftJoinAndSelect('k.author', 'author')
      .leftJoinAndSelect('k.category', 'category');

    // Filter by category ID (not string name)
    if (category && category !== 'all') {
      const categoryId = parseInt(category, 10);
      if (!isNaN(categoryId)) {
        query = query.where('k.categoryId = :categoryId', { categoryId });
      }
    }

    // Search by title or content
    if (search) {
      query = query.andWhere(
        '(k.title ILIKE :search OR k.content ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Determine sort order
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

  // Find one question with answers
  async findOneWithAnswers(id: string) {
    const question = await this.konsultasiRepository.findOne({
      where: { id },
      relations: ['author', 'category', 'answers', 'answers.author', 'answers.replies', 'answers.replies.author'],
    });

    if (!question) {
      throw new NotFoundException('Pertanyaan tidak ditemukan');
    }

    // Increment views
    question.views += 1;
    await this.konsultasiRepository.save(question);

    // Sort answers by votes and sort replies by creation date
    question.answers = question.answers.sort(
      (a, b) => b.votes - a.votes || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    // Sort replies by creation date for each answer
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

  // Find one question by slug
  async findOneBySlug(slug: string) {
    // Convert slug to words for flexible matching
    const slugWords = slug.split('-').filter(w => w.length > 0);
    
    // Get all questions and find the best match
    const questions = await this.konsultasiRepository
      .createQueryBuilder('k')
      .leftJoinAndSelect('k.author', 'author')
      .leftJoinAndSelect('k.category', 'category')
      .leftJoinAndSelect('k.answers', 'answers')
      .leftJoinAndSelect('answers.author', 'answer_author')
      .orderBy('k.createdAt', 'DESC')
      .getMany();

    // Find question where title contains all slug words
    const question = questions.find(q => {
      const titleLower = q.title.toLowerCase();
      return slugWords.every(word => titleLower.includes(word));
    });

    if (!question) {
      throw new NotFoundException('Pertanyaan tidak ditemukan');
    }

    // Increment views
    question.views += 1;
    await this.konsultasiRepository.save(question);

    // Sort answers by votes
    question.answers = question.answers.sort(
      (a, b) => b.votes - a.votes || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return {
      question,
      answers: question.answers,
    };
  }

  // Create new question
  async create(createKonsultasiDto: CreateKonsultasiDto, userId: string) {
    // Check for toxic content
    const toxicResult = await this.toxicFilterService.detectToxic(
      createKonsultasiDto.title + ' ' + createKonsultasiDto.content,
    );

    if (toxicResult.hasSevere) {
      throw new BadRequestException('Konten mengandung kata-kata yang tidak sesuai');
    }

    // Load category if provided
    let category: ConsultationCategory | null = null;
    if (createKonsultasiDto.categoryId) {
      category = await this.categoryRepository.findOne({
        where: { id: Number(createKonsultasiDto.categoryId) },
      });

      if (!category) {
        throw new BadRequestException('Kategori tidak ditemukan');
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

  // Update question
  async update(id: string, updateKonsultasiDto: UpdateKonsultasiDto, userId: string) {
    const question = await this.konsultasiRepository.findOne({
      where: { id },
    });

    if (!question) {
      throw new NotFoundException('Pertanyaan tidak ditemukan');
    }

    // Only author or admin can update
    if (question.authorId !== userId) {
      throw new ForbiddenException('Anda tidak memiliki akses untuk mengubah pertanyaan ini');
    }

    // Check for toxic content
    if (updateKonsultasiDto.title || updateKonsultasiDto.content) {
      const textToCheck =
        (updateKonsultasiDto.title || question.title) +
        ' ' +
        (updateKonsultasiDto.content || question.content);

      const toxicResult = await this.toxicFilterService.detectToxic(textToCheck);

      if (toxicResult.hasSevere) {
        throw new BadRequestException('Konten mengandung kata-kata yang tidak sesuai');
      }
    }

    // Update category if provided
    if (updateKonsultasiDto.categoryId) {
      const category: ConsultationCategory | null = await this.categoryRepository.findOne({
        where: { id: Number(updateKonsultasiDto.categoryId) },
      });

      if (!category) {
        throw new BadRequestException('Kategori tidak ditemukan');
      }

      question.categoryId = updateKonsultasiDto.categoryId;
      question.category = category;
    }

    // Update other fields
    if (updateKonsultasiDto.title) question.title = updateKonsultasiDto.title;
    if (updateKonsultasiDto.content) question.content = updateKonsultasiDto.content;

    return await this.konsultasiRepository.save(question);
  }

  // Delete question
  async delete(id: string, userId: string) {
    const question = await this.konsultasiRepository.findOne({
      where: { id },
    });

    if (!question) {
      throw new NotFoundException('Pertanyaan tidak ditemukan');
    }

    // Only author or admin can delete
    if (question.authorId !== userId) {
      throw new ForbiddenException('Anda tidak memiliki akses untuk menghapus pertanyaan ini');
    }

    // Delete all answers
    await this.answerRepository.delete({ konsultasiId: id });

    // Delete question
    await this.konsultasiRepository.delete(id);

    return { message: 'Pertanyaan berhasil dihapus' };
  }

  // Add answer to question
  async addAnswer(questionId: string, createAnswerDto: CreateAnswerDto, userId: string) {
    const question = await this.konsultasiRepository.findOne({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException('Pertanyaan tidak ditemukan');
    }

    // Check for toxic content
    const toxicResult = await this.toxicFilterService.detectToxic(createAnswerDto.content);

    if (toxicResult.hasSevere) {
      throw new BadRequestException('Konten mengandung kata-kata yang tidak sesuai');
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

    // Increment answer count
    question.answerCount += 1;
    await this.konsultasiRepository.save(question);

    return savedAnswer;
  }

  // Vote on question
  async voteQuestion(questionId: string, userId: string, vote: 1 | -1) {
    const question = await this.konsultasiRepository.findOne({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException('Pertanyaan tidak ditemukan');
    }

    const voters = question.voters as Array<{ userId: string; vote: 1 | -1 }>;
    const existingVote = voters.find(v => v.userId === userId);

    if (existingVote) {
      if (existingVote.vote === vote) {
        // Remove vote
        question.votes -= vote;
        question.voters = voters.filter(v => v.userId !== userId);
      } else {
        // Change vote
        question.votes -= existingVote.vote;
        question.votes += vote;
        existingVote.vote = vote;
      }
    } else {
      // Add vote
      question.votes += vote;
      voters.push({ userId, vote });
      question.voters = voters;
    }

    await this.konsultasiRepository.save(question);
    return { votes: question.votes };
  }

  // Vote on answer
  async voteAnswer(questionId: string, answerId: string, userId: string, vote: 1 | -1) {
    const answer = await this.answerRepository.findOne({
      where: { id: answerId },
    });

    if (!answer) {
      throw new NotFoundException('Jawaban tidak ditemukan');
    }

    const voters = answer.voters as Array<{ userId: string; vote: 1 | -1 }>;
    const existingVote = voters.find(v => v.userId === userId);

    if (existingVote) {
      if (existingVote.vote === vote) {
        // Remove vote
        if (vote === 1) {
          answer.votes--;
        } else {
          answer.downvotes--;
        }
        answer.voters = voters.filter(v => v.userId !== userId);
      } else {
        // Change vote
        if (existingVote.vote === 1) {
          answer.votes--;
        } else {
          answer.downvotes--;
        }
        
        if (vote === 1) {
          answer.votes++;
        } else {
          answer.downvotes++;
        }
        existingVote.vote = vote;
      }
    } else {
      // Add vote
      if (vote === 1) {
        answer.votes++;
      } else {
        answer.downvotes++;
      }
      voters.push({ userId, vote });
      answer.voters = voters;
    }

    await this.answerRepository.save(answer);
    return { votes: answer.votes, downvotes: answer.downvotes };
  }

  // Verify answer (BK only)
  async verifyAnswer(questionId: string, answerId: string, userId: string) {
    const answer = await this.answerRepository.findOne({
      where: { id: answerId },
    });

    if (!answer) {
      throw new NotFoundException('Jawaban tidak ditemukan');
    }

    answer.isVerified = true;
    answer.verifiedBy = userId;
    answer.verifiedAt = new Date();

    return await this.answerRepository.save(answer);
  }

  // Apply toxic filter - returns filtered text without modifying data
  async applyToxicFilter(questionId: string) {
    const question = await this.konsultasiRepository.findOne({
      where: { id: questionId },
      relations: ['answers'],
    });

    if (!question) {
      throw new NotFoundException('Pertanyaan tidak ditemukan');
    }

    const filteredTitle = await this.toxicFilterService.filterText(question.title);
    const filteredContent = await this.toxicFilterService.filterText(question.content);

    const filteredAnswers = await Promise.all(
      question.answers.map(async answer => ({
        ...answer,
        content: await this.toxicFilterService.filterText(answer.content),
      })),
    );

    return {
      question: {
        ...question,
        title: filteredTitle,
        content: filteredContent,
      },
      answers: filteredAnswers,
    };
  }

  // Get statistics
  async getStatistics() {
    const totalQuestions = await this.konsultasiRepository.count();
    const answeredQuestions = await this.konsultasiRepository.count({
      where: { answerCount: MoreThan(0) },
    });
    const totalAnswers = await this.answerRepository.count();
    const totalViews = (await this.konsultasiRepository.find()).reduce(
      (sum, q) => sum + q.views,
      0,
    );

    return {
      totalQuestions,
      answeredQuestions,
      unansweredQuestions: totalQuestions - answeredQuestions,
      totalAnswers,
      totalViews,
      answerRate: ((answeredQuestions / (totalQuestions || 1)) * 100).toFixed(2) + '%',
    };
  }

  // Bookmark a question
  async bookmarkQuestion(questionId: string, userId: string) {
    const question = await this.konsultasiRepository.findOne({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException('Pertanyaan tidak ditemukan');
    }

    // Check if already bookmarked
    const existingBookmark = await this.bookmarkRepository.findOne({
      where: { konsultasiId: questionId, userId },
    });

    if (existingBookmark) {
      throw new BadRequestException('Pertanyaan sudah di-bookmark');
    }

    const bookmark = this.bookmarkRepository.create({
      konsultasiId: questionId,
      userId,
    });

    await this.bookmarkRepository.save(bookmark);

    // Increment bookmark count
    question.bookmarkCount = (question.bookmarkCount || 0) + 1;
    await this.konsultasiRepository.save(question);

    return bookmark;
  }

  // Remove bookmark
  async removeBookmark(questionId: string, userId: string) {
    const result = await this.bookmarkRepository.delete({
      konsultasiId: questionId,
      userId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('Bookmark tidak ditemukan');
    }

    // Decrement bookmark count
    const question = await this.konsultasiRepository.findOne({
      where: { id: questionId },
    });

    if (question) {
      question.bookmarkCount = Math.max(0, (question.bookmarkCount || 0) - 1);
      await this.konsultasiRepository.save(question);
    }

    return { message: 'Bookmark berhasil dihapus' };
  }

  // Get user bookmarks
  async getUserBookmarks(userId: string) {
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

  // Check if question is bookmarked
  async isBookmarked(questionId: string, userId: string) {
    const bookmark = await this.bookmarkRepository.findOne({
      where: { konsultasiId: questionId, userId },
    });

    return {
      isBookmarked: !!bookmark,
    };
  }

  // Create reply to answer
  async createReply(questionId: string, answerId: string, createReplyDto: CreateReplyDto, userId: string | number) {
    // Verify question exists
    const question = await this.konsultasiRepository.findOne({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException('Pertanyaan tidak ditemukan');
    }

    // Verify answer exists
    const answer = await this.answerRepository.findOne({
      where: { id: answerId, konsultasiId: questionId },
    });

    if (!answer) {
      throw new NotFoundException('Jawaban tidak ditemukan');
    }

    // Get user info
    const user = await this.userRepository.findOne({
      where: { id: Number(userId) },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    // Create reply
    const reply = this.replyRepository.create({
      answerId,
      authorId: Number(userId),
      content: createReplyDto.content,
    });

    const savedReply = await this.replyRepository.save(reply);

    // Load user data for response
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

  // Vote on reply
  async voteReply(questionId: string, answerId: string, replyId: string, userId: string | number, vote: 1 | -1) {
    const reply = await this.replyRepository.findOne({
      where: { id: replyId, answerId },
    });

    if (!reply) {
      throw new NotFoundException('Balasan tidak ditemukan');
    }

    const numUserId = Number(userId);
    const voters = reply.voters as Array<{ userId: number; vote: 1 | -1 }>;
    const existingVote = voters.find(v => v.userId === numUserId);

    if (existingVote) {
      if (existingVote.vote === vote) {
        // Remove vote
        if (vote === 1) {
          reply.votes--;
        } else {
          reply.downvotes--;
        }
        reply.voters = voters.filter(v => v.userId !== numUserId);
      } else {
        // Change vote
        if (existingVote.vote === 1) {
          reply.votes--;
        } else {
          reply.downvotes--;
        }
        
        if (vote === 1) {
          reply.votes++;
        } else {
          reply.downvotes++;
        }
        existingVote.vote = vote;
      }
    } else {
      // Add vote
      if (vote === 1) {
        reply.votes++;
      } else {
        reply.downvotes++;
      }
      voters.push({ userId: numUserId, vote });
      reply.voters = voters;
    }

    await this.replyRepository.save(reply);
    return { votes: reply.votes, downvotes: reply.downvotes };
  }
}
