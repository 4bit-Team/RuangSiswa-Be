import { Repository } from 'typeorm';
import { Feedback } from './entities/feedback.entity';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { Reservasi } from './entities/reservasi.entity';
export declare class FeedbackService {
    private feedbackRepository;
    private reservasiRepository;
    constructor(feedbackRepository: Repository<Feedback>, reservasiRepository: Repository<Reservasi>);
    createFeedback(createFeedbackDto: CreateFeedbackDto, studentId: number): Promise<Feedback>;
    getFeedbackByReservasi(reservasiId: number): Promise<Feedback | null>;
    getFeedbackByCounselor(counselorId: number): Promise<Feedback[]>;
    getAverageRating(counselorId: number): Promise<number>;
    getFeedbackByStudent(studentId: number): Promise<Feedback[]>;
}
