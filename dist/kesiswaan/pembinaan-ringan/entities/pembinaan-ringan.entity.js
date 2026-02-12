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
exports.PembinaanRingan = void 0;
const typeorm_1 = require("typeorm");
const reservasi_entity_1 = require("../../../reservasi/entities/reservasi.entity");
const pembinaan_entity_1 = require("../../pembinaan/entities/pembinaan.entity");
const user_entity_1 = require("../../../users/entities/user.entity");
let PembinaanRingan = class PembinaanRingan {
    id;
    reservasi;
    reservasi_id;
    pembinaan;
    pembinaan_id;
    student_id;
    student_name;
    counselor;
    counselor_id;
    hasil_pembinaan;
    catatan_bk;
    scheduled_date;
    scheduled_time;
    status;
    bk_feedback;
    bk_notes;
    bk_decision_date;
    has_follow_up;
    follow_up_notes;
    createdAt;
    updatedAt;
    approvedAt;
    completedAt;
};
exports.PembinaanRingan = PembinaanRingan;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PembinaanRingan.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => reservasi_entity_1.Reservasi, { nullable: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'reservasi_id' }),
    __metadata("design:type", reservasi_entity_1.Reservasi)
], PembinaanRingan.prototype, "reservasi", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], PembinaanRingan.prototype, "reservasi_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => pembinaan_entity_1.Pembinaan, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'pembinaan_id' }),
    __metadata("design:type", pembinaan_entity_1.Pembinaan)
], PembinaanRingan.prototype, "pembinaan", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], PembinaanRingan.prototype, "pembinaan_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], PembinaanRingan.prototype, "student_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], PembinaanRingan.prototype, "student_name", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'counselor_id' }),
    __metadata("design:type", user_entity_1.User)
], PembinaanRingan.prototype, "counselor", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], PembinaanRingan.prototype, "counselor_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], PembinaanRingan.prototype, "hasil_pembinaan", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], PembinaanRingan.prototype, "catatan_bk", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], PembinaanRingan.prototype, "scheduled_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 5 }),
    __metadata("design:type", String)
], PembinaanRingan.prototype, "scheduled_time", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['pending', 'approved', 'rejected', 'in_progress', 'completed', 'cancelled'], default: 'pending' }),
    __metadata("design:type", String)
], PembinaanRingan.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PembinaanRingan.prototype, "bk_feedback", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PembinaanRingan.prototype, "bk_notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], PembinaanRingan.prototype, "bk_decision_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], PembinaanRingan.prototype, "has_follow_up", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PembinaanRingan.prototype, "follow_up_notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PembinaanRingan.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], PembinaanRingan.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], PembinaanRingan.prototype, "approvedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], PembinaanRingan.prototype, "completedAt", void 0);
exports.PembinaanRingan = PembinaanRingan = __decorate([
    (0, typeorm_1.Entity)('pembinaan_ringan'),
    (0, typeorm_1.Index)(['reservasi_id']),
    (0, typeorm_1.Index)(['pembinaan_id']),
    (0, typeorm_1.Index)(['counselor_id']),
    (0, typeorm_1.Index)(['status'])
], PembinaanRingan);
//# sourceMappingURL=pembinaan-ringan.entity.js.map