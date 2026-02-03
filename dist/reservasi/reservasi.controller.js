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
exports.ReservasiController = void 0;
const common_1 = require("@nestjs/common");
const reservasi_service_1 = require("./reservasi.service");
const create_reservasi_dto_1 = require("./dto/create-reservasi.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const feedback_service_1 = require("./feedback.service");
const create_feedback_dto_1 = require("./dto/create-feedback.dto");
let ReservasiController = class ReservasiController {
    reservasiService;
    feedbackService;
    constructor(reservasiService, feedbackService) {
        this.reservasiService = reservasiService;
        this.feedbackService = feedbackService;
    }
    async create(createReservasiDto, req) {
        console.log('Creating reservasi:', createReservasiDto);
        return await this.reservasiService.create(createReservasiDto);
    }
    async findAll(studentId, counselorId, status) {
        const filters = {
            studentId: studentId ? parseInt(studentId) : undefined,
            counselorId: counselorId ? parseInt(counselorId) : undefined,
            status,
        };
        return await this.reservasiService.findAll(filters);
    }
    async getMyReservations(req) {
        const studentId = req.user.id;
        return await this.reservasiService.findByStudentId(studentId);
    }
    async getByStudentId(studentId) {
        return await this.reservasiService.findByStudentId(parseInt(studentId));
    }
    async getPendingReservations(req) {
        const counselorId = req.user.id;
        return await this.reservasiService.getPendingForCounselor(counselorId);
    }
    async getSchedule(req, from, to) {
        const counselorId = req.user.id;
        const fromDate = from ? new Date(from) : new Date();
        const toDate = to ? new Date(to) : new Date(fromDate.getTime() + 30 * 24 * 60 * 60 * 1000);
        return await this.reservasiService.getSchedule(counselorId, fromDate, toDate);
    }
    async findOne(id) {
        return await this.reservasiService.findOne(parseInt(id));
    }
    async updateStatus(id, updateStatusDto, req) {
        const reservasi = await this.reservasiService.findOne(parseInt(id));
        if (!reservasi) {
            throw new common_1.NotFoundException('Reservasi not found');
        }
        console.log(`Updating reservasi ${id} status to ${updateStatusDto.status}`);
        return await this.reservasiService.updateStatus(parseInt(id), updateStatusDto);
    }
    async approveReservasi(id, req) {
        const reservasi = await this.reservasiService.findOne(parseInt(id));
        if (!reservasi) {
            throw new common_1.NotFoundException('Reservasi not found');
        }
        if (reservasi.counselorId !== req.user.id) {
            throw new common_1.BadRequestException('Unauthorized: Only the counselor can approve this reservasi');
        }
        console.log(`Approving reservasi ${id}`);
        return await this.reservasiService.updateStatus(parseInt(id), { status: 'approved' });
    }
    async rejectReservasi(id, body, req) {
        const reservasi = await this.reservasiService.findOne(parseInt(id));
        if (!reservasi) {
            throw new common_1.NotFoundException('Reservasi not found');
        }
        if (reservasi.counselorId !== req.user.id) {
            throw new common_1.BadRequestException('Unauthorized: Only the counselor can reject this reservasi');
        }
        console.log(`Rejecting reservasi ${id}`, body.reason);
        return await this.reservasiService.updateStatus(parseInt(id), {
            status: 'rejected',
            rejectionReason: body.reason
        });
    }
    async delete(id, req) {
        const reservasi = await this.reservasiService.findOne(parseInt(id));
        if (!reservasi) {
            throw new common_1.NotFoundException('Reservasi not found');
        }
        if (reservasi.studentId !== req.user.id && reservasi.counselorId !== req.user.id) {
            throw new common_1.BadRequestException('Unauthorized: Only student or counselor can delete this reservasi');
        }
        const success = await this.reservasiService.delete(parseInt(id));
        return { success, message: success ? 'Reservasi deleted' : 'Failed to delete' };
    }
    async cancelReservasi(id, body, req) {
        const reservasi = await this.reservasiService.findOne(parseInt(id));
        if (!reservasi) {
            throw new common_1.NotFoundException('Reservasi not found');
        }
        if (reservasi.studentId !== req.user.id) {
            throw new common_1.BadRequestException('Unauthorized: Only student can cancel this reservasi');
        }
        if (!['pending', 'approved'].includes(reservasi.status)) {
            throw new common_1.BadRequestException(`Cannot cancel reservasi with status ${reservasi.status}`);
        }
        console.log(`Cancelling reservasi ${id}`, body.reason);
        return await this.reservasiService.updateStatus(parseInt(id), {
            status: 'cancelled',
            rejectionReason: body.reason || 'Dibatalkan oleh siswa'
        });
    }
    async rescheduleReservasi(id, body, req) {
        const reservasi = await this.reservasiService.findOne(parseInt(id));
        if (!reservasi) {
            throw new common_1.NotFoundException('Reservasi not found');
        }
        if (reservasi.studentId !== req.user.id) {
            throw new common_1.BadRequestException('Unauthorized: Only student can reschedule this reservasi');
        }
        if (!['pending', 'approved'].includes(reservasi.status)) {
            throw new common_1.BadRequestException(`Cannot reschedule reservasi with status ${reservasi.status}`);
        }
        if (!body.preferredDate && !body.preferredTime && !body.counselorId) {
            throw new common_1.BadRequestException('At least one of preferredDate, preferredTime, or counselorId must be provided');
        }
        console.log(`Rescheduling reservasi ${id}`, body);
        return await this.reservasiService.reschedule(parseInt(id), body);
    }
    async generateQRCode(id, body, req) {
        const reservasi = await this.reservasiService.findOne(parseInt(id));
        if (!reservasi) {
            throw new common_1.NotFoundException('Reservasi not found');
        }
        if (reservasi.counselorId !== req.user.id) {
            throw new common_1.BadRequestException('Unauthorized: Only assigned counselor can generate QR code');
        }
        if (reservasi.status !== 'approved') {
            throw new common_1.BadRequestException(`Cannot generate QR for reservasi with status ${reservasi.status}`);
        }
        const room = 'bk room';
        await this.reservasiService.assignRoom(parseInt(id), room);
        const qrCode = await this.reservasiService.generateQRCode(parseInt(id));
        return {
            success: true,
            message: 'QR code generated successfully',
            data: {
                qrCode,
                room,
            },
        };
    }
    async confirmAttendance(id, body, req) {
        const reservasi = await this.reservasiService.findOne(parseInt(id));
        if (!reservasi) {
            throw new common_1.NotFoundException('Reservasi not found');
        }
        const isStudent = reservasi.studentId === req.user.id;
        const isCounselor = reservasi.counselorId === req.user.id;
        if (!isStudent && !isCounselor) {
            throw new common_1.BadRequestException('Unauthorized: Only assigned student or counselor can confirm attendance');
        }
        if (reservasi.status !== 'approved') {
            throw new common_1.BadRequestException(`Cannot confirm attendance for reservasi with status ${reservasi.status}`);
        }
        if (!reservasi.qrCode) {
            throw new common_1.BadRequestException('QR code has not been generated yet');
        }
        const updated = await this.reservasiService.confirmAttendance(parseInt(id), body.qrData);
        return {
            success: true,
            message: 'Attendance confirmed successfully. Session status changed to in_counseling',
            data: updated,
        };
    }
    async markAsCompleted(id, req) {
        const reservasi = await this.reservasiService.findOne(parseInt(id));
        if (!reservasi) {
            throw new common_1.NotFoundException('Reservasi not found');
        }
        if (reservasi.counselorId !== req.user.id) {
            throw new common_1.BadRequestException('Unauthorized: Only assigned counselor can mark as completed');
        }
        if (!['in_counseling', 'approved'].includes(reservasi.status)) {
            throw new common_1.BadRequestException(`Cannot mark as completed. Current status: ${reservasi.status}. Session must be in progress (in_counseling) or approved for chat sessions`);
        }
        const updated = await this.reservasiService.markAsCompleted(parseInt(id));
        return {
            success: true,
            message: 'Session marked as completed successfully. Status changed to selesai',
            data: updated,
        };
    }
    async createFeedback(createFeedbackDto, req) {
        const feedback = await this.feedbackService.createFeedback(createFeedbackDto, req.user.id);
        return {
            success: true,
            message: 'Feedback submitted successfully',
            data: feedback,
        };
    }
    async getFeedback(reservasiId, req) {
        const feedback = await this.feedbackService.getFeedbackByReservasi(parseInt(reservasiId));
        if (!feedback) {
            throw new common_1.NotFoundException('Feedback not found for this reservasi');
        }
        if (feedback.studentId !== req.user.id &&
            feedback.counselorId !== req.user.id) {
            throw new common_1.BadRequestException('Unauthorized: You can only view feedback related to you');
        }
        return {
            success: true,
            data: feedback,
        };
    }
    async getCounselorFeedback(counselorId, req) {
        if (parseInt(counselorId) !== req.user.id && req.user.role !== 'admin') {
            throw new common_1.BadRequestException('Unauthorized: You can only view your own feedback');
        }
        const feedbacks = await this.feedbackService.getFeedbackByCounselor(parseInt(counselorId));
        const averageRating = await this.feedbackService.getAverageRating(parseInt(counselorId));
        return {
            success: true,
            data: {
                feedbacks,
                averageRating,
                totalFeedbacks: feedbacks.length,
            },
        };
    }
    async getStudentFeedback(studentId, req) {
        if (parseInt(studentId) !== req.user.id && req.user.role !== 'admin') {
            throw new common_1.BadRequestException('Unauthorized: You can only view your own feedback');
        }
        const feedbacks = await this.feedbackService.getFeedbackByStudent(parseInt(studentId));
        return {
            success: true,
            data: feedbacks,
        };
    }
};
exports.ReservasiController = ReservasiController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_reservasi_dto_1.CreateReservasiDto, Object]),
    __metadata("design:returntype", Promise)
], ReservasiController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('studentId')),
    __param(1, (0, common_1.Query)('counselorId')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ReservasiController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('student/my-reservations'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReservasiController.prototype, "getMyReservations", null);
__decorate([
    (0, common_1.Get)('student/:studentId'),
    __param(0, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReservasiController.prototype, "getByStudentId", null);
__decorate([
    (0, common_1.Get)('counselor/pending'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReservasiController.prototype, "getPendingReservations", null);
__decorate([
    (0, common_1.Get)('counselor/schedule'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ReservasiController.prototype, "getSchedule", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReservasiController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('bk'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_reservasi_dto_1.UpdateReservasiStatusDto, Object]),
    __metadata("design:returntype", Promise)
], ReservasiController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)(':id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReservasiController.prototype, "approveReservasi", null);
__decorate([
    (0, common_1.Patch)(':id/reject'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ReservasiController.prototype, "rejectReservasi", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReservasiController.prototype, "delete", null);
__decorate([
    (0, common_1.Patch)(':id/cancel'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ReservasiController.prototype, "cancelReservasi", null);
__decorate([
    (0, common_1.Patch)(':id/reschedule'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ReservasiController.prototype, "rescheduleReservasi", null);
__decorate([
    (0, common_1.Post)(':id/generate-qr'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ReservasiController.prototype, "generateQRCode", null);
__decorate([
    (0, common_1.Post)(':id/confirm-attendance'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ReservasiController.prototype, "confirmAttendance", null);
__decorate([
    (0, common_1.Patch)(':id/complete'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReservasiController.prototype, "markAsCompleted", null);
__decorate([
    (0, common_1.Post)('feedback'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_feedback_dto_1.CreateFeedbackDto, Object]),
    __metadata("design:returntype", Promise)
], ReservasiController.prototype, "createFeedback", null);
__decorate([
    (0, common_1.Get)('feedback/:reservasiId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('reservasiId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReservasiController.prototype, "getFeedback", null);
__decorate([
    (0, common_1.Get)('counselor/:counselorId/feedback'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('counselorId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReservasiController.prototype, "getCounselorFeedback", null);
__decorate([
    (0, common_1.Get)('student/:studentId/feedback'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReservasiController.prototype, "getStudentFeedback", null);
exports.ReservasiController = ReservasiController = __decorate([
    (0, common_1.Controller)('reservasi'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [reservasi_service_1.ReservasiService,
        feedback_service_1.FeedbackService])
], ReservasiController);
//# sourceMappingURL=reservasi.controller.js.map