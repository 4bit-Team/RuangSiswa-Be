import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from './entities/feedback.entity';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { Reservasi } from './entities/reservasi.entity';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
    @InjectRepository(Reservasi)
    private reservasiRepository: Repository<Reservasi>,
  ) {}

  // Submit feedback untuk reservasi yang sudah selesai
  async createFeedback(createFeedbackDto: CreateFeedbackDto, studentId: number): Promise<Feedback> {
    // Verify reservasi exists dan belongs to student
    const reservasi = await this.reservasiRepository.findOne({
      where: { id: createFeedbackDto.reservasiId, studentId },
    });

    if (!reservasi) {
      throw new NotFoundException('Reservasi not found');
    }

    if (reservasi.status !== 'completed') {
      throw new BadRequestException('Feedback hanya bisa diberikan untuk sesi yang sudah selesai');
    }

    // Check if feedback already exists
    const existingFeedback = await this.feedbackRepository.findOne({
      where: { reservasiId: reservasi.id },
    });

    if (existingFeedback) {
      throw new BadRequestException('Feedback sudah pernah diberikan untuk sesi ini');
    }

    // Create feedback
    const feedback = this.feedbackRepository.create({
      reservasiId: reservasi.id,
      studentId: reservasi.studentId,
      counselorId: reservasi.counselorId,
      rating: createFeedbackDto.rating,
      comment: createFeedbackDto.comment,
    });

    return await this.feedbackRepository.save(feedback);
  }

  // Get feedback untuk reservasi
  async getFeedbackByReservasi(reservasiId: number): Promise<Feedback | null> {
    return await this.feedbackRepository.findOne({
      where: { reservasiId },
      relations: ['student', 'counselor'],
    });
  }

  // Get all feedback untuk counselor
  async getFeedbackByCounselor(counselorId: number): Promise<Feedback[]> {
    return await this.feedbackRepository.find({
      where: { counselorId },
      relations: ['student', 'reservasi'],
      order: { createdAt: 'DESC' },
    });
  }

  // Get average rating untuk counselor
  async getAverageRating(counselorId: number): Promise<number> {
    const result = await this.feedbackRepository
      .createQueryBuilder('feedback')
      .select('AVG(feedback.rating)', 'average')
      .where('feedback.counselorId = :counselorId', { counselorId })
      .getRawOne();

    return result?.average ? parseFloat(parseFloat(result.average).toFixed(1)) : 0;
  }

  // Get all feedback untuk student
  async getFeedbackByStudent(studentId: number): Promise<Feedback[]> {
    return await this.feedbackRepository.find({
      where: { studentId },
      relations: ['counselor', 'reservasi'],
      order: { createdAt: 'DESC' },
    });
  }
}
