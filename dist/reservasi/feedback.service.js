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
exports.FeedbackService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const feedback_entity_1 = require("./entities/feedback.entity");
const reservasi_entity_1 = require("./entities/reservasi.entity");
let FeedbackService = class FeedbackService {
    feedbackRepository;
    reservasiRepository;
    constructor(feedbackRepository, reservasiRepository) {
        this.feedbackRepository = feedbackRepository;
        this.reservasiRepository = reservasiRepository;
    }
    async createFeedback(createFeedbackDto, studentId) {
        const reservasi = await this.reservasiRepository.findOne({
            where: { id: createFeedbackDto.reservasiId, studentId },
        });
        if (!reservasi) {
            throw new common_1.NotFoundException('Reservasi not found');
        }
        if (reservasi.status !== 'completed') {
            throw new common_1.BadRequestException('Feedback hanya bisa diberikan untuk sesi yang sudah selesai');
        }
        const existingFeedback = await this.feedbackRepository.findOne({
            where: { reservasiId: reservasi.id },
        });
        if (existingFeedback) {
            throw new common_1.BadRequestException('Feedback sudah pernah diberikan untuk sesi ini');
        }
        const feedback = this.feedbackRepository.create({
            reservasiId: reservasi.id,
            studentId: reservasi.studentId,
            counselorId: reservasi.counselorId,
            rating: createFeedbackDto.rating,
            comment: createFeedbackDto.comment,
        });
        return await this.feedbackRepository.save(feedback);
    }
    async getFeedbackByReservasi(reservasiId) {
        return await this.feedbackRepository.findOne({
            where: { reservasiId },
            relations: ['student', 'counselor'],
        });
    }
    async getFeedbackByCounselor(counselorId) {
        return await this.feedbackRepository.find({
            where: { counselorId },
            relations: ['student', 'reservasi'],
            order: { createdAt: 'DESC' },
        });
    }
    async getAverageRating(counselorId) {
        const result = await this.feedbackRepository
            .createQueryBuilder('feedback')
            .select('AVG(feedback.rating)', 'average')
            .where('feedback.counselorId = :counselorId', { counselorId })
            .getRawOne();
        return result?.average ? parseFloat(parseFloat(result.average).toFixed(1)) : 0;
    }
    async getFeedbackByStudent(studentId) {
        return await this.feedbackRepository.find({
            where: { studentId },
            relations: ['counselor', 'reservasi'],
            order: { createdAt: 'DESC' },
        });
    }
};
exports.FeedbackService = FeedbackService;
exports.FeedbackService = FeedbackService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(feedback_entity_1.Feedback)),
    __param(1, (0, typeorm_1.InjectRepository)(reservasi_entity_1.Reservasi)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], FeedbackService);
//# sourceMappingURL=feedback.service.js.map