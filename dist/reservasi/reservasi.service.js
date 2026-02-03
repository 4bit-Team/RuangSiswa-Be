"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservasiService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const reservasi_entity_1 = require("./entities/reservasi.entity");
const counseling_category_entity_1 = require("../counseling-category/entities/counseling-category.entity");
const chat_service_1 = require("../chat/chat.service");
const QRCode = __importStar(require("qrcode"));
let ReservasiService = class ReservasiService {
    reservasiRepository;
    categoryRepository;
    chatService;
    constructor(reservasiRepository, categoryRepository, chatService) {
        this.reservasiRepository = reservasiRepository;
        this.categoryRepository = categoryRepository;
        this.chatService = chatService;
    }
    async create(createReservasiDto) {
        let topic = null;
        if (createReservasiDto.topicId) {
            topic = await this.categoryRepository.findOne({
                where: { id: Number(createReservasiDto.topicId) },
            });
            if (!topic) {
                throw new common_1.BadRequestException('Topik konseling tidak ditemukan');
            }
        }
        const reservasi = this.reservasiRepository.create({
            studentId: createReservasiDto.studentId,
            counselorId: createReservasiDto.counselorId,
            preferredDate: createReservasiDto.preferredDate,
            preferredTime: createReservasiDto.preferredTime,
            notes: createReservasiDto.notes,
            topicId: createReservasiDto.topicId,
            ...(topic && { topic }),
            status: 'pending',
        });
        return await this.reservasiRepository.save(reservasi);
    }
    async findAll(filters) {
        let query = this.reservasiRepository
            .createQueryBuilder('reservasi')
            .leftJoinAndSelect('reservasi.student', 'student')
            .leftJoinAndSelect('reservasi.counselor', 'counselor')
            .leftJoinAndSelect('reservasi.topic', 'topic');
        if (filters?.studentId) {
            query = query.where('reservasi.studentId = :studentId', { studentId: filters.studentId });
        }
        if (filters?.counselorId) {
            query = query.where('reservasi.counselorId = :counselorId', { counselorId: filters.counselorId });
        }
        if (filters?.status) {
            query = query.andWhere('reservasi.status = :status', { status: filters.status });
        }
        if (filters?.from && filters?.to) {
            query = query.andWhere('reservasi.preferredDate BETWEEN :from AND :to', {
                from: filters.from,
                to: filters.to,
            });
        }
        return await query.orderBy('reservasi.preferredDate', 'ASC').getMany();
    }
    async findOne(id) {
        return await this.reservasiRepository
            .createQueryBuilder('reservasi')
            .leftJoinAndSelect('reservasi.student', 'student')
            .leftJoinAndSelect('reservasi.counselor', 'counselor')
            .leftJoinAndSelect('reservasi.topic', 'topic')
            .where('reservasi.id = :id', { id })
            .getOne();
    }
    async findByStudentId(studentId) {
        return await this.reservasiRepository
            .createQueryBuilder('reservasi')
            .leftJoinAndSelect('reservasi.student', 'student')
            .leftJoinAndSelect('reservasi.counselor', 'counselor')
            .leftJoinAndSelect('reservasi.topic', 'topic')
            .where('reservasi.studentId = :studentId', { studentId })
            .orderBy('reservasi.preferredDate', 'DESC')
            .getMany();
    }
    async findByCounselorId(counselorId) {
        return await this.reservasiRepository
            .createQueryBuilder('reservasi')
            .leftJoinAndSelect('reservasi.student', 'student')
            .leftJoinAndSelect('reservasi.counselor', 'counselor')
            .leftJoinAndSelect('reservasi.topic', 'topic')
            .where('reservasi.counselorId = :counselorId', { counselorId })
            .orderBy('reservasi.preferredDate', 'DESC')
            .getMany();
    }
    async updateStatus(id, updateStatusDto) {
        const reservasi = await this.findOne(id);
        if (!reservasi) {
            throw new Error('Reservasi not found');
        }
        if (updateStatusDto.status === 'approved' && reservasi.status === 'pending') {
            try {
                const topicName = typeof reservasi.topic === 'object' ? reservasi.topic?.name : reservasi.topic;
                const conversation = await this.chatService.getOrCreateConversation(reservasi.counselorId, reservasi.studentId, `Sesi ${reservasi.type}: ${topicName || 'Konseling'}`);
                reservasi.conversationId = conversation.id;
                if (conversation.status === 'completed') {
                    await this.chatService.updateConversationStatus(conversation.id, 'active');
                    console.log(`✅ Reset conversation ${conversation.id} status dari 'completed' ke 'active'`);
                }
                if (reservasi.type === 'tatap-muka') {
                    const roomCount = await this.reservasiRepository.count({
                        where: { type: 'tatap-muka', status: 'approved' }
                    });
                    reservasi.room = `BK-${(roomCount % 3) + 1}`;
                    const qrData = JSON.stringify({
                        reservasiId: reservasi.id,
                        studentId: reservasi.studentId,
                        counselorId: reservasi.counselorId,
                        timestamp: new Date().toISOString(),
                    });
                    reservasi.qrCode = await QRCode.toDataURL(qrData);
                }
            }
            catch (error) {
                console.error('Error creating conversation or QR:', error);
                throw new Error('Failed to create chat conversation or generate QR');
            }
        }
        reservasi.status = updateStatusDto.status;
        if (updateStatusDto.rejectionReason) {
            reservasi.rejectionReason = updateStatusDto.rejectionReason;
        }
        return await this.reservasiRepository.save(reservasi);
    }
    async delete(id) {
        const result = await this.reservasiRepository.delete(id);
        return (result.affected ?? 0) > 0;
    }
    async getPendingForCounselor(counselorId) {
        return await this.reservasiRepository
            .createQueryBuilder('reservasi')
            .leftJoinAndSelect('reservasi.student', 'student')
            .leftJoinAndSelect('reservasi.counselor', 'counselor')
            .leftJoinAndSelect('reservasi.topic', 'topic')
            .where('reservasi.counselorId = :counselorId', { counselorId })
            .andWhere('reservasi.status = :status', { status: 'pending' })
            .orderBy('reservasi.preferredDate', 'ASC')
            .getMany();
    }
    async getSchedule(counselorId, from, to) {
        let query = this.reservasiRepository
            .createQueryBuilder('reservasi')
            .leftJoinAndSelect('reservasi.student', 'student')
            .leftJoinAndSelect('reservasi.counselor', 'counselor')
            .leftJoinAndSelect('reservasi.topic', 'topic')
            .where('reservasi.counselorId = :counselorId', { counselorId })
            .andWhere('reservasi.status = :status', { status: 'approved' });
        if (from && to) {
            query = query.andWhere('reservasi.preferredDate BETWEEN :from AND :to', {
                from: new Date(from),
                to: new Date(to),
            });
        }
        return await query
            .orderBy('reservasi.preferredDate', 'ASC')
            .addOrderBy('reservasi.preferredTime', 'ASC')
            .getMany();
    }
    async reschedule(id, rescheduleData) {
        const reservasi = await this.findOne(id);
        if (!reservasi) {
            throw new Error('Reservasi not found');
        }
        if (rescheduleData.preferredDate) {
            reservasi.preferredDate = new Date(rescheduleData.preferredDate);
        }
        if (rescheduleData.preferredTime) {
            reservasi.preferredTime = rescheduleData.preferredTime;
        }
        if (rescheduleData.counselorId) {
            reservasi.counselorId = rescheduleData.counselorId;
        }
        reservasi.status = 'pending';
        return await this.reservasiRepository.save(reservasi);
    }
    async generateQRCode(id) {
        const reservasi = await this.findOne(id);
        if (!reservasi) {
            throw new Error('Reservasi not found');
        }
        if (reservasi.type !== 'tatap-muka') {
            throw new Error('QR code hanya untuk sesi tatap muka');
        }
        const qrData = JSON.stringify({
            reservasiId: reservasi.id,
            studentId: reservasi.studentId,
            counselorId: reservasi.counselorId,
            timestamp: new Date().toISOString(),
        });
        const qrCode = await QRCode.toDataURL(qrData);
        reservasi.qrCode = qrCode;
        await this.reservasiRepository.save(reservasi);
        return qrCode;
    }
    async confirmAttendance(id, qrData) {
        const reservasi = await this.findOne(id);
        if (!reservasi) {
            throw new Error('Reservasi not found');
        }
        if (reservasi.type !== 'tatap-muka') {
            throw new Error('Attendance hanya untuk sesi tatap muka');
        }
        try {
            const data = JSON.parse(qrData);
            if (data.reservasiId !== id) {
                throw new Error('QR code tidak sesuai dengan reservasi');
            }
        }
        catch (error) {
            throw new Error('Invalid QR code');
        }
        reservasi.attendanceConfirmed = true;
        reservasi.status = 'in_counseling';
        await this.reservasiRepository.save(reservasi);
        if (reservasi.conversationId) {
            await this.chatService.updateConversationStatus(reservasi.conversationId, 'in_counseling');
        }
        return reservasi;
    }
    async markAsCompleted(id) {
        const reservasi = await this.findOne(id);
        if (!reservasi) {
            throw new Error('Reservasi not found');
        }
        if (!['in_counseling', 'approved'].includes(reservasi.status)) {
            throw new Error(`Cannot mark as completed from status ${reservasi.status}`);
        }
        reservasi.status = 'completed';
        reservasi.completedAt = new Date();
        const result = await this.reservasiRepository.save(reservasi);
        if (reservasi.conversationId) {
            await this.chatService.updateConversationStatus(reservasi.conversationId, 'completed');
        }
        return result;
    }
    async assignRoom(id, room) {
        const reservasi = await this.findOne(id);
        if (!reservasi) {
            throw new Error('Reservasi not found');
        }
        if (!room) {
            const roomCount = await this.reservasiRepository.count({
                where: { type: 'tatap-muka', status: 'approved' }
            });
            room = `BK-${(roomCount % 3) + 1}`;
        }
        reservasi.room = room;
        return await this.reservasiRepository.save(reservasi);
    }
};
exports.ReservasiService = ReservasiService;
exports.ReservasiService = ReservasiService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(reservasi_entity_1.Reservasi)),
    __param(1, (0, typeorm_1.InjectRepository)(counseling_category_entity_1.CounselingCategory)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        chat_service_1.ChatService])
], ReservasiService);
//# sourceMappingURL=reservasi.service.js.map