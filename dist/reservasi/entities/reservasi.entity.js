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
exports.Reservasi = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const counseling_category_entity_1 = require("../../counseling-category/entities/counseling-category.entity");
const pembinaan_entity_1 = require("../../kesiswaan/pembinaan/entities/pembinaan.entity");
let Reservasi = class Reservasi {
    id;
    studentId;
    student;
    counselorId;
    counselor;
    preferredDate;
    preferredTime;
    type;
    counselingType;
    pembinaanType;
    topic;
    topicId;
    pembinaan;
    pembinaan_id;
    pembinaanWaka;
    notes;
    status;
    conversationId;
    rejectionReason;
    room;
    qrCode;
    attendanceConfirmed;
    completedAt;
    createdAt;
    updatedAt;
};
exports.Reservasi = Reservasi;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Reservasi.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Reservasi.prototype, "studentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { eager: false }),
    (0, typeorm_1.JoinColumn)({ name: 'studentId' }),
    __metadata("design:type", user_entity_1.User)
], Reservasi.prototype, "student", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Reservasi.prototype, "counselorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { eager: false }),
    (0, typeorm_1.JoinColumn)({ name: 'counselorId' }),
    __metadata("design:type", user_entity_1.User)
], Reservasi.prototype, "counselor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], Reservasi.prototype, "preferredDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], Reservasi.prototype, "preferredTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', default: 'chat' }),
    __metadata("design:type", String)
], Reservasi.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', default: 'umum' }),
    __metadata("design:type", String)
], Reservasi.prototype, "counselingType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Reservasi.prototype, "pembinaanType", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => counseling_category_entity_1.CounselingCategory, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'topicId' }),
    __metadata("design:type", counseling_category_entity_1.CounselingCategory)
], Reservasi.prototype, "topic", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Reservasi.prototype, "topicId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => pembinaan_entity_1.Pembinaan, { eager: false, nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'pembinaan_id' }),
    __metadata("design:type", pembinaan_entity_1.Pembinaan)
], Reservasi.prototype, "pembinaan", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Reservasi.prototype, "pembinaan_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)('PembinaanWaka', 'reservasi', { nullable: true, eager: false }),
    __metadata("design:type", Object)
], Reservasi.prototype, "pembinaanWaka", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Reservasi.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', default: 'pending' }),
    __metadata("design:type", String)
], Reservasi.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Reservasi.prototype, "conversationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Reservasi.prototype, "rejectionReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Reservasi.prototype, "room", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Reservasi.prototype, "qrCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Reservasi.prototype, "attendanceConfirmed", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Reservasi.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Reservasi.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Reservasi.prototype, "updatedAt", void 0);
exports.Reservasi = Reservasi = __decorate([
    (0, typeorm_1.Entity)('reservasi')
], Reservasi);
//# sourceMappingURL=reservasi.entity.js.map