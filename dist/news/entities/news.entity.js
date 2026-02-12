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
exports.News = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const news_like_entity_1 = require("./news-like.entity");
const news_comment_entity_1 = require("./news-comment.entity");
const news_category_entity_1 = require("../../news-category/entities/news-category.entity");
let News = class News {
    id;
    title;
    summary;
    content;
    imageUrl;
    categories;
    status;
    viewCount;
    publishedDate;
    scheduledDate;
    author;
    authorId;
    likes;
    comments;
    createdAt;
    updatedAt;
};
exports.News = News;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], News.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], News.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], News.prototype, "summary", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], News.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], News.prototype, "imageUrl", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => news_category_entity_1.NewsCategory, { eager: true }),
    (0, typeorm_1.JoinTable)({
        name: 'news_categories',
        joinColumn: { name: 'newsId' },
        inverseJoinColumn: { name: 'categoryId' },
    }),
    __metadata("design:type", Array)
], News.prototype, "categories", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['draft', 'published', 'scheduled'], default: 'draft' }),
    __metadata("design:type", String)
], News.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], News.prototype, "viewCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'timestamp' }),
    __metadata("design:type", Date)
], News.prototype, "publishedDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'timestamp' }),
    __metadata("design:type", Date)
], News.prototype, "scheduledDate", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.newsArticles, { eager: true }),
    __metadata("design:type", user_entity_1.User)
], News.prototype, "author", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], News.prototype, "authorId", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => news_like_entity_1.NewsLike, (like) => like.news, { cascade: true }),
    __metadata("design:type", Array)
], News.prototype, "likes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => news_comment_entity_1.NewsComment, (comment) => comment.news, { cascade: true }),
    __metadata("design:type", Array)
], News.prototype, "comments", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], News.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], News.prototype, "updatedAt", void 0);
exports.News = News = __decorate([
    (0, typeorm_1.Entity)('news')
], News);
//# sourceMappingURL=news.entity.js.map