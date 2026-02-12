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
exports.ToxicFilterService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const toxic_filter_entity_1 = require("./entities/toxic-filter.entity");
let ToxicFilterService = class ToxicFilterService {
    toxicFilterRepository;
    filterCache = [];
    cacheTimestamp = 0;
    CACHE_DURATION = 5 * 60 * 1000;
    constructor(toxicFilterRepository) {
        this.toxicFilterRepository = toxicFilterRepository;
        this.refreshCache();
    }
    async refreshCache() {
        try {
            this.filterCache = await this.toxicFilterRepository.find({
                where: { isActive: true },
            });
            this.cacheTimestamp = Date.now();
        }
        catch (error) {
            console.error('Error refreshing toxic filter cache:', error);
        }
    }
    async getCachedFilters() {
        if (Date.now() - this.cacheTimestamp > this.CACHE_DURATION) {
            await this.refreshCache();
        }
        return this.filterCache;
    }
    async detectToxic(text) {
        const filters = await this.getCachedFilters();
        const lowerText = text.toLowerCase();
        const foundWords = [];
        let filteredText = text;
        let hasSevere = false;
        for (const filter of filters) {
            const pattern = new RegExp(`\\b${this.escapeRegex(filter.word)}\\b`, 'gi');
            if (pattern.test(lowerText)) {
                foundWords.push({
                    word: filter.word,
                    severity: filter.severity,
                    replacement: filter.replacement,
                });
                if (filter.severity === 'high') {
                    hasSevere = true;
                }
                filteredText = filteredText.replace(pattern, filter.replacement);
            }
        }
        return {
            isToxic: foundWords.length > 0,
            foundWords,
            filteredText,
            hasSevere,
        };
    }
    async hasSevereToxic(text) {
        const result = await this.detectToxic(text);
        return result.hasSevere;
    }
    async filterText(text) {
        const result = await this.detectToxic(text);
        return result.filteredText;
    }
    escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    async create(dto) {
        const filter = this.toxicFilterRepository.create({
            word: dto.word.toLowerCase(),
            severity: dto.severity || 'medium',
            replacement: dto.replacement || '***',
            isActive: dto.isActive !== false,
            description: dto.description,
        });
        const saved = await this.toxicFilterRepository.save(filter);
        await this.refreshCache();
        return saved;
    }
    async findAll(active) {
        const query = this.toxicFilterRepository.createQueryBuilder('filter');
        if (active !== undefined) {
            query.where('filter.isActive = :isActive', { isActive: active });
        }
        return query.orderBy('filter.severity', 'DESC').addOrderBy('filter.word', 'ASC').getMany();
    }
    async findById(id) {
        return this.toxicFilterRepository.findOne({ where: { id } });
    }
    async findByWord(word) {
        return this.toxicFilterRepository.findOne({
            where: { word: word.toLowerCase() },
        });
    }
    async update(id, dto) {
        if (dto.word) {
            dto.word = dto.word.toLowerCase();
        }
        await this.toxicFilterRepository.update(id, dto);
        await this.refreshCache();
        return this.findById(id);
    }
    async delete(id) {
        await this.toxicFilterRepository.delete(id);
        await this.refreshCache();
    }
    async getStatistics() {
        const all = await this.toxicFilterRepository.find();
        const active = await this.toxicFilterRepository.find({
            where: { isActive: true },
        });
        const bySeverity = {
            low: all.filter((f) => f.severity === 'low').length,
            medium: all.filter((f) => f.severity === 'medium').length,
            high: all.filter((f) => f.severity === 'high').length,
        };
        return {
            totalFilters: all.length,
            activeFilters: active.length,
            bySeveity: bySeverity,
        };
    }
};
exports.ToxicFilterService = ToxicFilterService;
exports.ToxicFilterService = ToxicFilterService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(toxic_filter_entity_1.ToxicFilter)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ToxicFilterService);
//# sourceMappingURL=toxic-filter.service.js.map