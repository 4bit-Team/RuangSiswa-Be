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
exports.StudentCardService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const student_card_entity_1 = require("./entities/student-card.entity");
const users_service_1 = require("../users/users.service");
let StudentCardService = class StudentCardService {
    cardRepo;
    usersService;
    constructor(cardRepo, usersService) {
        this.cardRepo = cardRepo;
        this.usersService = usersService;
    }
    async create(createDto) {
        console.log('📩 [StudentCardService] Create DTO diterima:', createDto);
        const user = await this.usersService.findOne(createDto.userId);
        if (!user)
            throw new common_1.NotFoundException(`User #${createDto.userId} not found`);
        const card = this.cardRepo.create({
            user: user,
            file_path: createDto.file_path,
            extracted_data: createDto.extracted_data ?? undefined,
        });
        console.log('💾 [StudentCardService] Akan disimpan ke DB:', card);
        const saved = await this.cardRepo.save(card);
        console.log('✅ [StudentCardService] Berhasil disimpan:', saved);
        return saved;
    }
    findAll() {
        return this.cardRepo.find({ relations: ['user'] });
    }
    async findOne(id) {
        const card = await this.cardRepo.findOne({ where: { id }, relations: ['user'] });
        if (!card)
            throw new common_1.NotFoundException(`Student card #${id} not found`);
        return card;
    }
    async findByUserId(userId) {
        return await this.cardRepo.findOne({ where: { user: { id: userId } }, relations: ['user'] });
    }
    async update(id, updateDto) {
        const card = await this.findOne(id);
        if (updateDto.file_path) {
            card.file_path = updateDto.file_path;
        }
        return this.cardRepo.save(card);
    }
    async remove(id) {
        const card = await this.findOne(id);
        return this.cardRepo.remove(card);
    }
};
exports.StudentCardService = StudentCardService;
exports.StudentCardService = StudentCardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(student_card_entity_1.StudentCard)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        users_service_1.UsersService])
], StudentCardService);
//# sourceMappingURL=student-card.service.js.map