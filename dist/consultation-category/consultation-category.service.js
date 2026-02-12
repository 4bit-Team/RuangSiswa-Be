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
exports.ConsultationCategoryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const consultation_category_entity_1 = require("./entities/consultation-category.entity");
let ConsultationCategoryService = class ConsultationCategoryService {
    categoryRepository;
    constructor(categoryRepository) {
        this.categoryRepository = categoryRepository;
    }
    async create(createDto) {
        const existing = await this.categoryRepository.findOne({
            where: { name: createDto.name },
        });
        if (existing) {
            throw new common_1.ConflictException(`Category with name "${createDto.name}" already exists`);
        }
        const category = this.categoryRepository.create(createDto);
        return await this.categoryRepository.save(category);
    }
    async findAll(isActive) {
        const query = this.categoryRepository.createQueryBuilder('category');
        if (isActive !== undefined) {
            query.where('category.isActive = :isActive', { isActive });
        }
        return await query.orderBy('category.name', 'ASC').getMany();
    }
    async findById(id) {
        const category = await this.categoryRepository.findOne({
            where: { id },
        });
        if (!category) {
            throw new common_1.NotFoundException(`Category with ID ${id} not found`);
        }
        return category;
    }
    async update(id, updateDto) {
        const category = await this.findById(id);
        if (updateDto.name && updateDto.name !== category.name) {
            const existing = await this.categoryRepository.findOne({
                where: { name: updateDto.name },
            });
            if (existing) {
                throw new common_1.ConflictException(`Category with name "${updateDto.name}" already exists`);
            }
        }
        Object.assign(category, updateDto);
        return await this.categoryRepository.save(category);
    }
    async delete(id) {
        const category = await this.findById(id);
        await this.categoryRepository.remove(category);
        return { success: true, message: 'Category deleted successfully' };
    }
    async incrementUsage(id) {
        await this.categoryRepository.increment({ id }, 'usageCount', 1);
    }
    async decrementUsage(id) {
        await this.categoryRepository.decrement({ id }, 'usageCount', 1);
    }
};
exports.ConsultationCategoryService = ConsultationCategoryService;
exports.ConsultationCategoryService = ConsultationCategoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(consultation_category_entity_1.ConsultationCategory)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ConsultationCategoryService);
//# sourceMappingURL=consultation-category.service.js.map