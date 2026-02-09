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
exports.Konsultasi = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const konsultasi_answer_entity_1 = require("./konsultasi-answer.entity");
const konsultasi_bookmark_entity_1 = require("./konsultasi-bookmark.entity");
const consultation_category_entity_1 = require("../../consultation-category/entities/consultation-category.entity");
let Konsultasi = class Konsultasi {
    id;
    title;
    content;
    category;
    categoryId;
    authorId;
    author;
    tags;
    views;
    votes;
    voters;
    answerCount;
    bookmarkCount;
    isResolved;
    answers;
    bookmarks;
    createdAt;
    updatedAt;
};
exports.Konsultasi = Konsultasi;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Konsultasi.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Konsultasi.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Konsultasi.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => consultation_category_entity_1.ConsultationCategory, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'categoryId' }),
    __metadata("design:type", consultation_category_entity_1.ConsultationCategory)
], Konsultasi.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Konsultasi.prototype, "categoryId", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], Konsultasi.prototype, "authorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'authorId' }),
    __metadata("design:type", user_entity_1.User)
], Konsultasi.prototype, "author", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata("design:type", Array)
], Konsultasi.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Konsultasi.prototype, "views", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Konsultasi.prototype, "votes", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { default: '[]' }),
    __metadata("design:type", Array)
], Konsultasi.prototype, "voters", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Konsultasi.prototype, "answerCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Konsultasi.prototype, "bookmarkCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Konsultasi.prototype, "isResolved", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => konsultasi_answer_entity_1.KonsultasiAnswer, answer => answer.konsultasi, { cascade: true }),
    __metadata("design:type", Array)
], Konsultasi.prototype, "answers", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => konsultasi_bookmark_entity_1.KonsultasiBookmark, bookmark => bookmark.konsultasi, { cascade: true }),
    __metadata("design:type", Array)
], Konsultasi.prototype, "bookmarks", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Konsultasi.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Konsultasi.prototype, "updatedAt", void 0);
exports.Konsultasi = Konsultasi = __decorate([
    (0, typeorm_1.Entity)('konsultasi'),
    (0, typeorm_1.Index)('idx_konsultasi_category', ['category']),
    (0, typeorm_1.Index)('idx_konsultasi_author', ['authorId']),
    (0, typeorm_1.Index)('idx_konsultasi_views_votes', ['views', 'votes'])
], Konsultasi);
//# sourceMappingURL=konsultasi.entity.js.map