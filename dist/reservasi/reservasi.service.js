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
const pembinaan_entity_1 = require("../kesiswaan/pembinaan/entities/pembinaan.entity");
const pembinaan_waka_entity_1 = require("../kesiswaan/pembinaan-waka/entities/pembinaan-waka.entity");
const laporan_bk_service_1 = require("../laporan-bk/laporan-bk.service");
const notification_service_1 = require("../notifications/notification.service");
const QRCode = __importStar(require("qrcode"));
let ReservasiService = class ReservasiService {
    reservasiRepository;
    categoryRepository;
    pembinaanRepository;
    pembinaanWakaRepository;
    chatService;
    laporanBkService;
    notificationService;
    constructor(reservasiRepository, categoryRepository, pembinaanRepository, pembinaanWakaRepository, chatService, laporanBkService, notificationService) {
        this.reservasiRepository = reservasiRepository;
        this.categoryRepository = categoryRepository;
        this.pembinaanRepository = pembinaanRepository;
        this.pembinaanWakaRepository = pembinaanWakaRepository;
        this.chatService = chatService;
        this.laporanBkService = laporanBkService;
        this.notificationService = notificationService;
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
                if (reservasi.counselingType === 'khusus' && reservasi.pembinaanType === 'ringan') {
                    try {
                        const fullReservasi = await this.reservasiRepository.findOne({
                            where: { id: reservasi.id },
                            relations: ['student', 'pembinaan'],
                        });
                        if (fullReservasi && fullReservasi.pembinaan) {
                            const laporanBkDto = {
                                reservasi_id: fullReservasi.id,
                                pembinaan_id: fullReservasi.pembinaan_id,
                                student_id: fullReservasi.studentId,
                                bk_id: fullReservasi.counselorId,
                            };
                            await this.laporanBkService.create(laporanBkDto);
                            console.log(`✅ Auto-created LaporanBK for ringan reservasi ${fullReservasi.id}`);
                        }
                    }
                    catch (error) {
                        console.warn('Failed to auto-create LaporanBK for ringan reservasi:', error);
                    }
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
        const updatedReservasi = await this.reservasiRepository.save(reservasi);
        try {
            if (updateStatusDto.status === 'approved') {
                if (updatedReservasi.counselingType === 'khusus' && updatedReservasi.pembinaanType) {
                    if (this.notificationService) {
                        await this.notificationService.create({
                            recipient_id: updatedReservasi.counselorId,
                            type: 'pembinaan_disetujui',
                            title: 'Pembinaan Disetujui',
                            message: `Pembinaan untuk siswa dari reservasi ID ${updatedReservasi.id} telah disetujui oleh ${updatedReservasi.pembinaanType === 'ringan' ? 'BK' : 'WAKA'}. Siap untuk dimulai pada ${new Date(updatedReservasi.preferredDate).toLocaleDateString('id-ID')}.`,
                            related_id: updatedReservasi.id,
                            related_type: 'reservasi',
                            metadata: {
                                student_id: updatedReservasi.studentId,
                                pembinaan_type: updatedReservasi.pembinaanType,
                                preferred_date: updatedReservasi.preferredDate,
                                approved_by: updatedReservasi.counselorId,
                            },
                        });
                        console.log(`✅ Notification sent: pembinaan_disetujui for kesiswaan`);
                    }
                }
                else {
                    if (this.notificationService) {
                        await this.notificationService.create({
                            recipient_id: updatedReservasi.studentId,
                            type: 'reservasi_approved',
                            title: 'Reservasi Disetujui',
                            message: `Reservasi konseling ${updatedReservasi.type || 'Anda'} telah disetujui. Silakan cek jadwal sesi Anda.`,
                            related_id: updatedReservasi.id,
                            related_type: 'reservasi',
                            metadata: {
                                student_id: updatedReservasi.studentId,
                                counselor_id: updatedReservasi.counselorId,
                                reservasi_type: updatedReservasi.type,
                                preferred_date: updatedReservasi.preferredDate,
                            },
                        });
                        console.log(`✅ Notification sent: reservasi_approved for student ${updatedReservasi.studentId}`);
                    }
                }
            }
            else if (updateStatusDto.status === 'rejected') {
                if (this.notificationService) {
                    await this.notificationService.create({
                        recipient_id: updatedReservasi.studentId,
                        type: 'reservasi_rejected',
                        title: 'Reservasi Ditolak',
                        message: `Reservasi konseling Anda ditolak oleh konselor. ${updateStatusDto.rejectionReason ? `Alasan: ${updateStatusDto.rejectionReason}` : ''}`,
                        related_id: updatedReservasi.id,
                        related_type: 'reservasi',
                        metadata: {
                            student_id: updatedReservasi.studentId,
                            counselor_id: updatedReservasi.counselorId,
                            rejection_reason: updateStatusDto.rejectionReason,
                        },
                    });
                    console.log(`✅ Notification sent: reservasi_rejected for student ${updatedReservasi.studentId}`);
                }
            }
        }
        catch (error) {
            console.warn('Failed to create notification for reservasi status change:', error);
        }
        return updatedReservasi;
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
    async createPembinaanReservasi(dto) {
        const pembinaan = await this.pembinaanRepository.findOne({
            where: { id: dto.pembinaan_id },
        });
        if (!pembinaan) {
            throw new common_1.BadRequestException(`Pembinaan with ID ${dto.pembinaan_id} not found`);
        }
        if (!pembinaan.siswas_id) {
            throw new common_1.BadRequestException('Pembinaan does not have associated student');
        }
        if (!['ringan', 'berat'].includes(dto.pembinaanType)) {
            throw new common_1.BadRequestException(`Invalid pembinaanType: ${dto.pembinaanType}. Must be 'ringan' or 'berat'`);
        }
        if (!dto.counselorId) {
            throw new common_1.BadRequestException('counselorId is required');
        }
        const reservasi = this.reservasiRepository.create({
            studentId: pembinaan.siswas_id,
            counselorId: dto.counselorId,
            preferredDate: dto.preferredDate,
            preferredTime: dto.preferredTime,
            type: dto.type || 'tatap-muka',
            counselingType: 'khusus',
            pembinaanType: dto.pembinaanType,
            pembinaan_id: dto.pembinaan_id,
            room: dto.room,
            notes: dto.notes,
            status: 'pending',
        });
        const savedReservasi = await this.reservasiRepository.save(reservasi);
        try {
            if (this.notificationService) {
                await this.notificationService.create({
                    recipient_id: dto.counselorId,
                    type: 'reservasi_pembinaan_dibuat',
                    title: 'Reservasi Pembinaan Dibuat',
                    message: `Reservasi pembinaan telah dibuat. Tipe: ${dto.pembinaanType === 'ringan' ? 'Ringan (BK)' : 'Berat (WAKA)'}. Menunggu persetujuan.`,
                    related_id: savedReservasi.id,
                    related_type: 'reservasi',
                    metadata: {
                        student_id: savedReservasi.studentId,
                        pembinaan_id: dto.pembinaan_id,
                        pembinaan_type: dto.pembinaanType,
                        preferred_date: dto.preferredDate,
                    },
                });
                console.log(`✅ Notification sent: reservasi_pembinaan_dibuat for kesiswaan staff`);
            }
        }
        catch (error) {
            console.warn('Failed to create notification for pembinaan reservasi creation:', error);
        }
        if (dto.pembinaanType === 'berat') {
            try {
                const pembinaanWaka = this.pembinaanWakaRepository.create({
                    reservasi_id: savedReservasi.id,
                    pembinaan_id: dto.pembinaan_id,
                    waka_id: dto.counselorId,
                    status: 'pending',
                    created_by: dto.counselorId,
                });
                await this.pembinaanWakaRepository.save(pembinaanWaka);
            }
            catch (error) {
                console.warn('Failed to create PembinaanWaka for berat pembinaan:', error);
            }
        }
        if (dto.pembinaanType === 'ringan') {
            try {
                await this.laporanBkService.create({
                    reservasi_id: savedReservasi.id,
                    pembinaan_id: dto.pembinaan_id,
                    student_id: pembinaan.siswas_id,
                    bk_id: dto.counselorId,
                });
            }
            catch (error) {
                console.warn('Failed to create LaporanBK for ringan pembinaan:', error);
            }
        }
        try {
            const conversationData = await this.chatService.getConversation(savedReservasi.studentId, pembinaan.siswas_id, 50);
            savedReservasi.conversationId = conversationData.conversation.id;
            await this.reservasiRepository.save(savedReservasi);
        }
        catch (error) {
            console.warn('Failed to create conversation for pembinaan reservasi:', error);
        }
        return savedReservasi;
    }
    async findByCounselingType(counselingType) {
        return this.reservasiRepository.find({
            where: { counselingType: counselingType },
            relations: ['student', 'counselor', 'pembinaan'],
        });
    }
    async findByPembinaanId(pembinaan_id) {
        return this.reservasiRepository.findOne({
            where: { pembinaan_id },
            relations: ['student', 'counselor', 'pembinaan'],
        });
    }
    async findByPembinaanType(pembinaanType) {
        return this.reservasiRepository.find({
            where: {
                pembinaanType,
                counselingType: 'khusus'
            },
            relations: ['student', 'counselor', 'pembinaan'],
        });
    }
};
exports.ReservasiService = ReservasiService;
exports.ReservasiService = ReservasiService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(reservasi_entity_1.Reservasi)),
    __param(1, (0, typeorm_1.InjectRepository)(counseling_category_entity_1.CounselingCategory)),
    __param(2, (0, typeorm_1.InjectRepository)(pembinaan_entity_1.Pembinaan)),
    __param(3, (0, typeorm_1.InjectRepository)(pembinaan_waka_entity_1.PembinaanWaka)),
    __param(6, (0, common_1.Optional)()),
    __param(6, (0, common_1.Inject)((0, common_1.forwardRef)(() => notification_service_1.NotificationService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        chat_service_1.ChatService,
        laporan_bk_service_1.LaporanBkService,
        notification_service_1.NotificationService])
], ReservasiService);
//# sourceMappingURL=reservasi.service.js.map