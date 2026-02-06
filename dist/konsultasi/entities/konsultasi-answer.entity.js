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
exports.KonsultasiAnswer = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const konsultasi_entity_1 = require("./konsultasi.entity");
const konsultasi_answer_reply_entity_1 = require("./konsultasi-answer-reply.entity");
let KonsultasiAnswer = class KonsultasiAnswer {
    id;
    konsultasiId;
    konsultasi;
    authorId;
    author;
    content;
    votes;
    downvotes;
    voters;
    isVerified;
    verifiedBy;
    verifiedAt;
    attachment;
    createdAt;
    updatedAt;
    replies;
};
exports.KonsultasiAnswer = KonsultasiAnswer;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], KonsultasiAnswer.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], KonsultasiAnswer.prototype, "konsultasiId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => konsultasi_entity_1.Konsultasi, konsultasi => konsultasi.answers, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'konsultasiId' }),
    __metadata("design:type", konsultasi_entity_1.Konsultasi)
], KonsultasiAnswer.prototype, "konsultasi", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], KonsultasiAnswer.prototype, "authorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'authorId' }),
    __metadata("design:type", user_entity_1.User)
], KonsultasiAnswer.prototype, "author", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], KonsultasiAnswer.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], KonsultasiAnswer.prototype, "votes", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], KonsultasiAnswer.prototype, "downvotes", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { default: '[]' }),
    __metadata("design:type", Array)
], KonsultasiAnswer.prototype, "voters", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], KonsultasiAnswer.prototype, "isVerified", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid', { nullable: true }),
    __metadata("design:type", Object)
], KonsultasiAnswer.prototype, "verifiedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], KonsultasiAnswer.prototype, "verifiedAt", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", Object)
], KonsultasiAnswer.prototype, "attachment", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], KonsultasiAnswer.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], KonsultasiAnswer.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => konsultasi_answer_reply_entity_1.KonsultasiAnswerReply, reply => reply.answer),
    __metadata("design:type", Array)
], KonsultasiAnswer.prototype, "replies", void 0);
exports.KonsultasiAnswer = KonsultasiAnswer = __decorate([
    (0, typeorm_1.Entity)('konsultasi_answers'),
    (0, typeorm_1.Index)('idx_konsultasi_answer_konsultasi', ['konsultasiId']),
    (0, typeorm_1.Index)('idx_konsultasi_answer_author', ['authorId']),
    (0, typeorm_1.Index)('idx_konsultasi_answer_verified', ['isVerified'])
], KonsultasiAnswer);
//# sourceMappingURL=konsultasi-answer.entity.js.map