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
exports.GroupReservasiService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const group_reservasi_entity_1 = require("./entities/group-reservasi.entity");
const counseling_category_entity_1 = require("../counseling-category/entities/counseling-category.entity");
const user_entity_1 = require("../users/entities/user.entity");
let GroupReservasiService = class GroupReservasiService {
    groupReservasiRepository;
    categoryRepository;
    userRepository;
    constructor(groupReservasiRepository, categoryRepository, userRepository) {
        this.groupReservasiRepository = groupReservasiRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
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
            status: 'pending',
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
            .where('groupReservasi.counselorId = :counselorId', { counselorId })
            .andWhere('groupReservasi.status = :status', { status: 'pending' })
            .orderBy('groupReservasi.createdAt', 'DESC')
            .getMany();
    }
    async updateStatus(id, updateStatusDto) {
        const groupReservasi = await this.findOne(id);
        if (!groupReservasi) {
            throw new common_1.NotFoundException('Group reservasi tidak ditemukan');
        }
        groupReservasi.status = updateStatusDto.status;
        if (updateStatusDto.rejectionReason) {
            groupReservasi.rejectionReason = updateStatusDto.rejectionReason;
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
        typeorm_2.Repository])
], GroupReservasiService);
//# sourceMappingURL=group-reservasi.service.js.map