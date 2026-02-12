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
exports.GroupReservasiService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const group_reservasi_entity_1 = require("./entities/group-reservasi.entity");
const counseling_category_entity_1 = require("../counseling-category/entities/counseling-category.entity");
const user_entity_1 = require("../users/entities/user.entity");
const reservasi_status_enum_1 = require("./enums/reservasi-status.enum");
const session_type_enum_1 = require("./enums/session-type.enum");
const chat_service_1 = require("../chat/chat.service");
const QRCode = __importStar(require("qrcode"));
let GroupReservasiService = class GroupReservasiService {
    groupReservasiRepository;
    categoryRepository;
    userRepository;
    chatService;
    constructor(groupReservasiRepository, categoryRepository, userRepository, chatService) {
        this.groupReservasiRepository = groupReservasiRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.chatService = chatService;
    }
    async create(createGroupReservasiDto) {
        let topic = null;
        if (createGroupReservasiDto.topicId) {
            topic = await this.categoryRepository.findOne({
                where: { id: Number(createGroupReservasiDto.topicId) },
            });
            if (!topic) {
                throw new common_1.BadRequestException('Topik konseling tidak ditemukan');
            }
        }
        const students = await this.userRepository.find({
            where: {
                id: (0, typeorm_2.In)(createGroupReservasiDto.studentIds),
            },
        });
        if (students.length !== createGroupReservasiDto.studentIds.length) {
            throw new common_1.BadRequestException('Salah satu atau lebih siswa tidak ditemukan');
        }
        if (students.length < 2) {
            throw new common_1.BadRequestException('Konseling kelompok harus memiliki minimal 2 siswa');
        }
        const groupReservasi = this.groupReservasiRepository.create({
            groupName: createGroupReservasiDto.groupName,
            creatorId: createGroupReservasiDto.creatorId,
            students,
            counselorId: createGroupReservasiDto.counselorId,
            preferredDate: createGroupReservasiDto.preferredDate,
            preferredTime: createGroupReservasiDto.preferredTime,
            type: createGroupReservasiDto.type,
            topicId: createGroupReservasiDto.topicId,
            notes: createGroupReservasiDto.notes,
            room: createGroupReservasiDto.room,
            status: reservasi_status_enum_1.ReservasiStatus.PENDING,
            ...(topic && { topic }),
        });
        return await this.groupReservasiRepository.save(groupReservasi);
    }
    async findAll(filters) {
        let query = this.groupReservasiRepository
            .createQueryBuilder('groupReservasi')
            .leftJoinAndSelect('groupReservasi.creator', 'creator')
            .leftJoinAndSelect('groupReservasi.counselor', 'counselor')
            .leftJoinAndSelect('groupReservasi.students', 'students')
            .leftJoinAndSelect('groupReservasi.topic', 'topic');
        if (filters?.creatorId) {
            query = query.where('groupReservasi.creatorId = :creatorId', { creatorId: filters.creatorId });
        }
        if (filters?.counselorId) {
            query = query.where('groupReservasi.counselorId = :counselorId', { counselorId: filters.counselorId });
        }
        if (filters?.status) {
            query = query.andWhere('groupReservasi.status = :status', { status: filters.status });
        }
        if (filters?.from && filters?.to) {
            query = query.andWhere('groupReservasi.preferredDate BETWEEN :from AND :to', {
                from: filters.from,
                to: filters.to,
            });
        }
        return await query.orderBy('groupReservasi.preferredDate', 'ASC').getMany();
    }
    async findOne(id) {
        return await this.groupReservasiRepository
            .createQueryBuilder('groupReservasi')
            .leftJoinAndSelect('groupReservasi.creator', 'creator')
            .leftJoinAndSelect('groupReservasi.counselor', 'counselor')
            .leftJoinAndSelect('groupReservasi.students', 'students')
            .leftJoinAndSelect('groupReservasi.topic', 'topic')
            .where('groupReservasi.id = :id', { id })
            .getOne();
    }
    async findByStudentId(studentId) {
        return await this.groupReservasiRepository
            .createQueryBuilder('groupReservasi')
            .leftJoinAndSelect('groupReservasi.creator', 'creator')
            .leftJoinAndSelect('groupReservasi.counselor', 'counselor')
            .leftJoinAndSelect('groupReservasi.students', 'students')
            .leftJoinAndSelect('groupReservasi.topic', 'topic')
            .where('groupReservasi.creatorId = :studentId OR students.id = :studentId', { studentId })
            .orderBy('groupReservasi.preferredDate', 'ASC')
            .getMany();
    }
    async findByCounselorId(counselorId) {
        return await this.groupReservasiRepository
            .createQueryBuilder('groupReservasi')
            .leftJoinAndSelect('groupReservasi.creator', 'creator')
            .leftJoinAndSelect('groupReservasi.counselor', 'counselor')
            .leftJoinAndSelect('groupReservasi.students', 'students')
            .leftJoinAndSelect('groupReservasi.topic', 'topic')
            .where('groupReservasi.counselorId = :counselorId', { counselorId })
            .orderBy('groupReservasi.preferredDate', 'ASC')
            .getMany();
    }
    async getPendingForCounselor(counselorId) {
        return await this.groupReservasiRepository
            .createQueryBuilder('groupReservasi')
            .leftJoinAndSelect('groupReservasi.creator', 'creator')
            .leftJoinAndSelect('groupReservasi.counselor', 'counselor')
            .leftJoinAndSelect('groupReservasi.students', 'students')
            .leftJoinAndSelect('groupReservasi.topic', 'topic')
            .where('groupReservasi.counselorId = :counselorId', { counselorId: counselorId })
            .andWhere('groupReservasi.status = :status', { status: reservasi_status_enum_1.ReservasiStatus.PENDING })
            .orderBy('groupReservasi.createdAt', 'DESC')
            .getMany();
    }
    async updateStatus(id, updateStatusDto) {
        const groupReservasi = await this.findOne(id);
        if (!groupReservasi) {
            throw new common_1.NotFoundException('Group reservasi tidak ditemukan');
        }
        if (updateStatusDto.status === reservasi_status_enum_1.ReservasiStatus.APPROVED && groupReservasi.status === reservasi_status_enum_1.ReservasiStatus.PENDING) {
            try {
                if (groupReservasi.type === session_type_enum_1.SessionType.TATAP_MUKA) {
                    const roomCount = await this.groupReservasiRepository.count({
                        where: { type: session_type_enum_1.SessionType.TATAP_MUKA, status: reservasi_status_enum_1.ReservasiStatus.APPROVED }
                    });
                    groupReservasi.room = `BK-${(roomCount % 3) + 1}`;
                }
            }
            catch (error) {
                console.error('Error during approval:', error);
                throw new Error('Failed to process group reservasi approval');
            }
        }
        groupReservasi.status = updateStatusDto.status;
        if (updateStatusDto.rejectionReason) {
            groupReservasi.rejectionReason = updateStatusDto.rejectionReason;
        }
        return await this.groupReservasiRepository.save(groupReservasi);
    }
    async initializeSessionResources(id) {
        const groupReservasi = await this.findOne(id);
        if (!groupReservasi) {
            throw new Error('Group Reservasi not found');
        }
        if (groupReservasi.status !== reservasi_status_enum_1.ReservasiStatus.APPROVED) {
            throw new Error('Group Reservasi must be approved before initializing session resources');
        }
        const [hours, minutes] = groupReservasi.preferredTime.split(':').map(Number);
        const sessionStart = new Date(groupReservasi.preferredDate);
        sessionStart.setHours(hours, minutes, 0);
        const fifteenMinutesBefore = new Date(sessionStart.getTime() - 15 * 60 * 1000);
        const now = new Date();
        if (now < fifteenMinutesBefore) {
            throw new Error('Session resources cannot be initialized yet. Please try again 15 minutes before the session.');
        }
        if (groupReservasi.type === session_type_enum_1.SessionType.TATAP_MUKA && !groupReservasi.qrCode) {
            const qrData = JSON.stringify({
                reservasiId: groupReservasi.id,
                counselorId: groupReservasi.counselorId,
                timestamp: new Date().toISOString(),
                isGroup: true,
            });
            groupReservasi.qrCode = await QRCode.toDataURL(qrData);
            groupReservasi.qrGeneratedAt = new Date();
            console.log(`✅ QR Code generated for group reservasi ${id}`);
        }
        if (!groupReservasi.conversationId && groupReservasi.students && groupReservasi.students.length > 0) {
            try {
                const topicName = typeof groupReservasi.topic === 'object' ? groupReservasi.topic?.name : groupReservasi.topic;
                const conversation = await this.chatService.getOrCreateConversation(groupReservasi.counselorId, groupReservasi.students[0].id, `Sesi Kelompok ${groupReservasi.type}: ${topicName || 'Konseling'}`);
                groupReservasi.conversationId = conversation.id;
                groupReservasi.chatInitializedAt = new Date();
                if (conversation.status === 'completed') {
                    await this.chatService.updateConversationStatus(conversation.id, 'active');
                    console.log(`✅ Reset conversation ${conversation.id} status dari 'completed' ke 'active'`);
                }
                console.log(`✅ Chat conversation created/initialized for group reservasi ${id}`);
            }
            catch (error) {
                console.error('Error creating conversation:', error);
                throw new Error('Failed to create chat conversation');
            }
        }
        return await this.groupReservasiRepository.save(groupReservasi);
    }
    async remove(id) {
        const groupReservasi = await this.findOne(id);
        if (!groupReservasi) {
            throw new common_1.NotFoundException('Group reservasi tidak ditemukan');
        }
        return await this.groupReservasiRepository.remove(groupReservasi);
    }
};
exports.GroupReservasiService = GroupReservasiService;
exports.GroupReservasiService = GroupReservasiService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(group_reservasi_entity_1.GroupReservasi)),
    __param(1, (0, typeorm_1.InjectRepository)(counseling_category_entity_1.CounselingCategory)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        chat_service_1.ChatService])
], GroupReservasiService);
//# sourceMappingURL=group-reservasi.service.js.map