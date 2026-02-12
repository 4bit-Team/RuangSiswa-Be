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
exports.LaporanBk = void 0;
const typeorm_1 = require("typeorm");
const reservasi_entity_1 = require("../../reservasi/entities/reservasi.entity");
const pembinaan_entity_1 = require("../../kesiswaan/pembinaan/entities/pembinaan.entity");
const user_entity_1 = require("../../users/entities/user.entity");
let LaporanBk = class LaporanBk {
    id;
    reservasi;
    reservasi_id;
    pembinaan;
    pembinaan_id;
    student_id;
    student_name;
    student_class;
    bk;
    bk_id;
    session_date;
    session_duration_minutes;
    session_type;
    session_location;
    session_topic;
    session_notes;
    student_response;
    student_understanding_level;
    student_participation_level;
    behavioral_improvement;
    recommendations;
    follow_up_date;
    follow_up_status;
    parent_notified;
    parent_notification_date;
    parent_notification_content;
    escalated_to_waka;
    escalation_reason;
    escalation_date;
    bimbingan_pembina_id;
    status;
    total_sessions;
    final_assessment;
    internal_notes;
    created_at;
    updated_at;
    created_by;
    updated_by;
};
exports.LaporanBk = LaporanBk;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], LaporanBk.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => reservasi_entity_1.Reservasi, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'reservasi_id' }),
    __metadata("design:type", reservasi_entity_1.Reservasi)
], LaporanBk.prototype, "reservasi", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], LaporanBk.prototype, "reservasi_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => pembinaan_entity_1.Pembinaan, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'pembinaan_id' }),
    __metadata("design:type", pembinaan_entity_1.Pembinaan)
], LaporanBk.prototype, "pembinaan", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], LaporanBk.prototype, "pembinaan_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], LaporanBk.prototype, "student_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], LaporanBk.prototype, "student_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], LaporanBk.prototype, "student_class", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'bk_id' }),
    __metadata("design:type", user_entity_1.User)
], LaporanBk.prototype, "bk", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], LaporanBk.prototype, "bk_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], LaporanBk.prototype, "session_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], LaporanBk.prototype, "session_duration_minutes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['individu', 'kelompok', 'keluarga'], nullable: true }),
    __metadata("design:type", String)
], LaporanBk.prototype, "session_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], LaporanBk.prototype, "session_location", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], LaporanBk.prototype, "session_topic", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], LaporanBk.prototype, "session_notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], LaporanBk.prototype, "student_response", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['sangat_memahami', 'memahami', 'cukup', 'kurang'], nullable: true }),
    __metadata("design:type", String)
], LaporanBk.prototype, "student_understanding_level", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['sangat_aktif', 'aktif', 'cukup', 'pasif'], nullable: true }),
    __metadata("design:type", String)
], LaporanBk.prototype, "student_participation_level", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], LaporanBk.prototype, "behavioral_improvement", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], LaporanBk.prototype, "recommendations", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], LaporanBk.prototype, "follow_up_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], LaporanBk.prototype, "follow_up_status", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], LaporanBk.prototype, "parent_notified", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], LaporanBk.prototype, "parent_notification_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], LaporanBk.prototype, "parent_notification_content", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], LaporanBk.prototype, "escalated_to_waka", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], LaporanBk.prototype, "escalation_reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], LaporanBk.prototype, "escalation_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], LaporanBk.prototype, "bimbingan_pembina_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['ongoing', 'completed', 'needs_escalation', 'archived'], default: 'ongoing' }),
    __metadata("design:type", String)
], LaporanBk.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], LaporanBk.prototype, "total_sessions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], LaporanBk.prototype, "final_assessment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], LaporanBk.prototype, "internal_notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], LaporanBk.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], LaporanBk.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], LaporanBk.prototype, "created_by", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], LaporanBk.prototype, "updated_by", void 0);
exports.LaporanBk = LaporanBk = __decorate([
    (0, typeorm_1.Entity)('laporan_bk'),
    (0, typeorm_1.Index)(['reservasi_id']),
    (0, typeorm_1.Index)(['pembinaan_id']),
    (0, typeorm_1.Index)(['bk_id']),
    (0, typeorm_1.Index)(['student_id'])
], LaporanBk);
//# sourceMappingURL=laporan-bk.entity.js.map