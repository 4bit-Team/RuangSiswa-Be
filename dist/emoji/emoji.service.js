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
exports.EmojiService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const emoji_entity_1 = require("./entities/emoji.entity");
let EmojiService = class EmojiService {
    emojiRepository;
    constructor(emojiRepository) {
        this.emojiRepository = emojiRepository;
    }
    async create(dto) {
        const emoji = this.emojiRepository.create({
            emoji: dto.emoji,
            name: dto.name,
            category: dto.category || 'other',
            keywords: dto.keywords,
            isActive: dto.isActive !== false,
        });
        return this.emojiRepository.save(emoji);
    }
    async findAll(active) {
        const query = this.emojiRepository.createQueryBuilder('emoji');
        if (active !== undefined) {
            query.where('emoji.isActive = :isActive', { isActive: active });
        }
        return query.orderBy('emoji.category', 'ASC').addOrderBy('emoji.name', 'ASC').getMany();
    }
    async findById(id) {
        return this.emojiRepository.findOne({ where: { id } });
    }
    async findByEmoji(emoji) {
        return this.emojiRepository.findOne({ where: { emoji } });
    }
    async findByCategory(category) {
        return this.emojiRepository.find({
            where: { category, isActive: true },
            order: { name: 'ASC' },
        });
    }
    async search(query) {
        return this.emojiRepository
            .createQueryBuilder('emoji')
            .where('emoji.name ILIKE :query', { query: `%${query}%` })
            .orWhere('emoji.keywords ILIKE :query', { query: `%${query}%` })
            .andWhere('emoji.isActive = true')
            .orderBy('emoji.name', 'ASC')
            .getMany();
    }
    async update(id, dto) {
        await this.emojiRepository.update(id, dto);
        return this.findById(id);
    }
    async delete(id) {
        await this.emojiRepository.delete(id);
    }
    async getCategories() {
        const result = await this.emojiRepository
            .createQueryBuilder('emoji')
            .select('DISTINCT emoji.category', 'category')
            .where('emoji.isActive = true')
            .orderBy('emoji.category', 'ASC')
            .getRawMany();
        return result.map((r) => r.category).filter((c) => c);
    }
};
exports.EmojiService = EmojiService;
exports.EmojiService = EmojiService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(emoji_entity_1.Emoji)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], EmojiService);
//# sourceMappingURL=emoji.service.js.map