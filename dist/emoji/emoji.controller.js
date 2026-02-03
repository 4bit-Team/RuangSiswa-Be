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
exports.EmojiController = void 0;
const common_1 = require("@nestjs/common");
const emoji_service_1 = require("./emoji.service");
const create_emoji_dto_1 = require("./dto/create-emoji.dto");
const update_emoji_dto_1 = require("./dto/update-emoji.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let EmojiController = class EmojiController {
    emojiService;
    constructor(emojiService) {
        this.emojiService = emojiService;
    }
    async getAllEmojis(active) {
        const isActive = active === undefined ? undefined : (active === 'false' ? false : true);
        return await this.emojiService.findAll(isActive);
    }
    async searchEmojis(query) {
        if (!query || query.length < 1) {
            return [];
        }
        return await this.emojiService.search(query);
    }
    async getCategories() {
        return await this.emojiService.getCategories();
    }
    async getEmojiById(id) {
        const emoji = await this.emojiService.findById(id);
        if (!emoji) {
            throw new common_1.NotFoundException('Emoji not found');
        }
        return emoji;
    }
    async createEmoji(dto) {
        const existing = await this.emojiService.findByEmoji(dto.emoji);
        if (existing) {
            throw new common_1.BadRequestException('Emoji already exists');
        }
        return await this.emojiService.create(dto);
    }
    async updateEmoji(id, dto) {
        const emoji = await this.emojiService.findById(id);
        if (!emoji) {
            throw new common_1.NotFoundException('Emoji not found');
        }
        return await this.emojiService.update(id, dto);
    }
    async deleteEmoji(id) {
        const emoji = await this.emojiService.findById(id);
        if (!emoji) {
            throw new common_1.NotFoundException('Emoji not found');
        }
        await this.emojiService.delete(id);
        return { message: 'Emoji deleted successfully' };
    }
};
exports.EmojiController = EmojiController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('active')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmojiController.prototype, "getAllEmojis", null);
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmojiController.prototype, "searchEmojis", null);
__decorate([
    (0, common_1.Get)('categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EmojiController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], EmojiController.prototype, "getEmojiById", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_emoji_dto_1.CreateEmojiDto]),
    __metadata("design:returntype", Promise)
], EmojiController.prototype, "createEmoji", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_emoji_dto_1.UpdateEmojiDto]),
    __metadata("design:returntype", Promise)
], EmojiController.prototype, "updateEmoji", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], EmojiController.prototype, "deleteEmoji", null);
exports.EmojiController = EmojiController = __decorate([
    (0, common_1.Controller)('emojis'),
    __metadata("design:paramtypes", [emoji_service_1.EmojiService])
], EmojiController);
//# sourceMappingURL=emoji.controller.js.map