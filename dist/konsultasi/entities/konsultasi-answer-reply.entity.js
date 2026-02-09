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
exports.KonsultasiAnswerReply = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const konsultasi_answer_entity_1 = require("./konsultasi-answer.entity");
let KonsultasiAnswerReply = class KonsultasiAnswerReply {
    id;
    answerId;
    answer;
    authorId;
    author;
    content;
    votes;
    downvotes;
    voters;
    isVerified;
    createdAt;
    updatedAt;
};
exports.KonsultasiAnswerReply = KonsultasiAnswerReply;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], KonsultasiAnswerReply.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], KonsultasiAnswerReply.prototype, "answerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => konsultasi_answer_entity_1.KonsultasiAnswer, answer => answer.replies, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'answerId' }),
    __metadata("design:type", konsultasi_answer_entity_1.KonsultasiAnswer)
], KonsultasiAnswerReply.prototype, "answer", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], KonsultasiAnswerReply.prototype, "authorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'authorId' }),
    __metadata("design:type", user_entity_1.User)
], KonsultasiAnswerReply.prototype, "author", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], KonsultasiAnswerReply.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], KonsultasiAnswerReply.prototype, "votes", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], KonsultasiAnswerReply.prototype, "downvotes", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { default: '[]' }),
    __metadata("design:type", Array)
], KonsultasiAnswerReply.prototype, "voters", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], KonsultasiAnswerReply.prototype, "isVerified", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], KonsultasiAnswerReply.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], KonsultasiAnswerReply.prototype, "updatedAt", void 0);
exports.KonsultasiAnswerReply = KonsultasiAnswerReply = __decorate([
    (0, typeorm_1.Entity)('konsultasi_answer_replies'),
    (0, typeorm_1.Index)('idx_answer_reply_answer', ['answerId']),
    (0, typeorm_1.Index)('idx_answer_reply_author', ['authorId'])
], KonsultasiAnswerReply);
//# sourceMappingURL=konsultasi-answer-reply.entity.js.map