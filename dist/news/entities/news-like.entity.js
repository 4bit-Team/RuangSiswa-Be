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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsLike = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const news_entity_1 = require("./news.entity");
let NewsLike = class NewsLike {
    id;
    news;
    newsId;
    user;
    userId;
    createdAt;
};
exports.NewsLike = NewsLike;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], NewsLike.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => news_entity_1.News, (news) => news.likes, { onDelete: 'CASCADE' }),
    __metadata("design:type", news_entity_1.News)
], NewsLike.prototype, "news", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], NewsLike.prototype, "newsId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { eager: true }),
    __metadata("design:type", user_entity_1.User)
], NewsLike.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], NewsLike.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], NewsLike.prototype, "createdAt", void 0);
exports.NewsLike = NewsLike = __decorate([
    (0, typeorm_1.Entity)('news_likes')
], NewsLike);
//# sourceMappingURL=news-like.entity.js.map