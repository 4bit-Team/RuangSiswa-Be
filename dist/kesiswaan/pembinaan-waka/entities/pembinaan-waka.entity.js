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
exports.PembinaanWaka = void 0;
const typeorm_1 = require("typeorm");
const reservasi_entity_1 = require("../../../reservasi/entities/reservasi.entity");
const pembinaan_entity_1 = require("../../pembinaan/entities/pembinaan.entity");
const user_entity_1 = require("../../../users/entities/user.entity");
let PembinaanWaka = class PembinaanWaka {
    id;
    reservasi;
    reservasi_id;
    pembinaan;
    pembinaan_id;
    waka;
    waka_id;
    status;
    wak_decision;
    decision_reason;
    notes;
    decision_date;
    student_response;
    student_acknowledged;
    parent_notified;
    parent_notification_date;
    has_appeal;
    appeal_reason;
    appeal_date;
    appeal_decision;
    created_at;
    updated_at;
    created_by;
    updated_by;
};
exports.PembinaanWaka = PembinaanWaka;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PembinaanWaka.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => reservasi_entity_1.Reservasi, reservasi => reservasi.pembinaanWaka, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'reservasi_id' }),
    __metadata("design:type", reservasi_entity_1.Reservasi)
], PembinaanWaka.prototype, "reservasi", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], PembinaanWaka.prototype, "reservasi_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => pembinaan_entity_1.Pembinaan, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'pembinaan_id' }),
    __metadata("design:type", pembinaan_entity_1.Pembinaan)
], PembinaanWaka.prototype, "pembinaan", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], PembinaanWaka.prototype, "pembinaan_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'waka_id' }),
    __metadata("design:type", user_entity_1.User)
], PembinaanWaka.prototype, "waka", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], PembinaanWaka.prototype, "waka_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['pending', 'in_review', 'decided', 'executed', 'appealed'], default: 'pending' }),
    __metadata("design:type", String)
], PembinaanWaka.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['sp3', 'do'], nullable: true }),
    __metadata("design:type", Object)
], PembinaanWaka.prototype, "wak_decision", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PembinaanWaka.prototype, "decision_reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PembinaanWaka.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], PembinaanWaka.prototype, "decision_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PembinaanWaka.prototype, "student_response", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], PembinaanWaka.prototype, "student_acknowledged", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], PembinaanWaka.prototype, "parent_notified", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], PembinaanWaka.prototype, "parent_notification_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], PembinaanWaka.prototype, "has_appeal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PembinaanWaka.prototype, "appeal_reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], PembinaanWaka.prototype, "appeal_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['sp3', 'do'], nullable: true }),
    __metadata("design:type", Object)
], PembinaanWaka.prototype, "appeal_decision", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PembinaanWaka.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], PembinaanWaka.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], PembinaanWaka.prototype, "created_by", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], PembinaanWaka.prototype, "updated_by", void 0);
exports.PembinaanWaka = PembinaanWaka = __decorate([
    (0, typeorm_1.Entity)('pembinaan_waka'),
    (0, typeorm_1.Index)(['reservasi_id']),
    (0, typeorm_1.Index)(['pembinaan_id']),
    (0, typeorm_1.Index)(['waka_id'])
], PembinaanWaka);
//# sourceMappingURL=pembinaan-waka.entity.js.map