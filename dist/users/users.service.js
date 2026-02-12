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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
let UsersService = class UsersService {
    userRepo;
    constructor(userRepo) {
        this.userRepo = userRepo;
    }
    async create(createUserDto) {
        const user = this.userRepo.create(createUserDto);
        if (createUserDto.kelas_id) {
            user.kelas = { id: createUserDto.kelas_id };
        }
        if (createUserDto.jurusan_id) {
            user.jurusan = { id: createUserDto.jurusan_id };
        }
        return this.userRepo.save(user);
    }
    findAll() {
        return this.userRepo.find();
    }
    findByRole(role) {
        if (!role) {
            return this.userRepo.find();
        }
        return this.userRepo.find({
            where: { role: role.toLowerCase() },
        });
    }
    async findByRoleAndStudentId(role, studentId) {
        if (!role) {
            return [];
        }
        return this.userRepo.find({
            where: {
                role: role.toLowerCase(),
                student_id: studentId,
            },
            select: ['id', 'fullName', 'email', 'phone_number', 'role', 'student_id'],
        });
    }
    findOne(id) {
        return this.userRepo.findOne({ where: { id } });
    }
    async updateStatus(id, status) {
        await this.userRepo
            .createQueryBuilder()
            .update(user_entity_1.User)
            .set({ status: status })
            .where('id = :id', { id })
            .execute();
        const updatedUser = await this.findOne(id);
        if (!updatedUser)
            throw new Error('User not found after update');
        return updatedUser;
    }
    async updateRuanganFromOcr(id, ruangan) {
        await this.userRepo
            .createQueryBuilder()
            .update(user_entity_1.User)
            .set({ kelas_lengkap: ruangan })
            .where('id = :id', { id })
            .execute();
        const updatedUser = await this.findOne(id);
        if (!updatedUser)
            throw new Error('User not found after update');
        return updatedUser;
    }
    async update(id, updateUserDto) {
        const user = await this.findOne(id);
        if (!user)
            return null;
        if (updateUserDto.kelas_id) {
            user.kelas = { id: updateUserDto.kelas_id };
        }
        if (updateUserDto.jurusan_id) {
            user.jurusan = { id: updateUserDto.jurusan_id };
        }
        Object.assign(user, updateUserDto);
        return this.userRepo.save(user);
    }
    async remove(id) {
        const user = await this.findOne(id);
        if (!user)
            return null;
        return this.userRepo.remove(user);
    }
    findOneByEmail(email) {
        return this.userRepo.findOne({
            where: { email },
            relations: ['kelas', 'jurusan'],
        });
    }
    async getStudentsByJurusanIds(jurusanIds) {
        if (!jurusanIds || jurusanIds.length === 0) {
            return [];
        }
        return await this.userRepo.find({
            where: {
                role: 'siswa',
                jurusan: { id: jurusanIds[0] },
            },
            relations: ['jurusan', 'kelas'],
        });
    }
    async getStudentsByJurusanIdsAdvanced(jurusanIds) {
        if (!jurusanIds || jurusanIds.length === 0) {
            return [];
        }
        return await this.userRepo
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.jurusan', 'jurusan')
            .leftJoinAndSelect('user.kelas', 'kelas')
            .where('user.role = :role', { role: 'siswa' })
            .andWhere('user.jurusanId IN (:...jurusanIds)', { jurusanIds })
            .orderBy('user.fullName', 'ASC')
            .getMany();
    }
    async getCountByRole() {
        const counts = await this.userRepo
            .createQueryBuilder('user')
            .select('user.role', 'role')
            .addSelect('COUNT(*)', 'count')
            .groupBy('user.role')
            .getRawMany();
        const result = {
            total: 0,
            siswa: 0,
            bk: 0,
            kesiswaan: 0,
            admin: 0,
        };
        counts.forEach((item) => {
            const count = parseInt(item.count, 10);
            result[item.role] = count;
            result.total += count;
        });
        return result;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map