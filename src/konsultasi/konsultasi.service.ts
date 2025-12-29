import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { CreateKonsultasiDto } from './dto/create-konsultasi.dto';
import { UpdateKonsultasiDto } from './dto/update-konsultasi.dto';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { Konsultasi } from './entities/konsultasi.entity';
import { KonsultasiAnswer } from './entities/konsultasi-answer.entity';
import { ToxicFilterService } from '../toxic-filter/toxic-filter.service';

@Injectable()
export class KonsultasiService {
  constructor(
    @InjectRepository(Konsultasi)
    private konsultasiRepository: Repository<Konsultasi>,
    @InjectRepository(KonsultasiAnswer)
    private answerRepository: Repository<KonsultasiAnswer>,
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

    let query = this.konsultasiRepository.createQueryBuilder('k').leftJoinAndSelect('k.author', 'author');

    // Filter by category
    if (category && category !== 'all') {
      query = query.where('k.category = :category', { category });
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
      relations: ['author', 'answers', 'answers.author'],
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

    const question = this.konsultasiRepository.create({
      ...createKonsultasiDto,
      authorId: userId,
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

    Object.assign(question, updateKonsultasiDto);
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
        answer.votes -= vote;
        answer.voters = voters.filter(v => v.userId !== userId);
      } else {
        // Change vote
        answer.votes -= existingVote.vote;
        answer.votes += vote;
        existingVote.vote = vote;
      }
    } else {
      // Add vote
      answer.votes += vote;
      voters.push({ userId, vote });
      answer.voters = voters;
    }

    await this.answerRepository.save(answer);
    return { votes: answer.votes };
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
}
