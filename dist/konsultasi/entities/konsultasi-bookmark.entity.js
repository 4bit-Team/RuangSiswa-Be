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
exports.KonsultasiBookmark = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const konsultasi_entity_1 = require("./konsultasi.entity");
let KonsultasiBookmark = class KonsultasiBookmark {
    id;
    userId;
    user;
    konsultasiId;
    konsultasi;
    createdAt;
};
exports.KonsultasiBookmark = KonsultasiBookmark;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], KonsultasiBookmark.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], KonsultasiBookmark.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], KonsultasiBookmark.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], KonsultasiBookmark.prototype, "konsultasiId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => konsultasi_entity_1.Konsultasi, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'konsultasiId' }),
    __metadata("design:type", konsultasi_entity_1.Konsultasi)
], KonsultasiBookmark.prototype, "konsultasi", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], KonsultasiBookmark.prototype, "createdAt", void 0);
exports.KonsultasiBookmark = KonsultasiBookmark = __decorate([
    (0, typeorm_1.Entity)('konsultasi_bookmark'),
    (0, typeorm_1.Index)('idx_konsultasi_bookmark_user', ['userId']),
    (0, typeorm_1.Index)('idx_konsultasi_bookmark_question', ['konsultasiId']),
    (0, typeorm_1.Unique)('uq_konsultasi_bookmark_user_question', ['userId', 'konsultasiId'])
], KonsultasiBookmark);
//# sourceMappingURL=konsultasi-bookmark.entity.js.map