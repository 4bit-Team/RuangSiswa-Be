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
exports.TardinessPattern = exports.TardinessAlert = exports.TardinessSummary = exports.TardinessAppeal = exports.TardinessRecord = void 0;
const typeorm_1 = require("typeorm");
let TardinessRecord = class TardinessRecord {
    id;
    student_id;
    student_name;
    class_id;
    tanggal;
    keterlambatan_menit;
    status;
    alasan;
    bukti_foto;
    catatan_petugas;
    has_appeal;
    created_at;
    updated_at;
    created_by;
    verified_by;
};
exports.TardinessRecord = TardinessRecord;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TardinessRecord.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], TardinessRecord.prototype, "student_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], TardinessRecord.prototype, "student_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], TardinessRecord.prototype, "class_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", String)
], TardinessRecord.prototype, "tanggal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], TardinessRecord.prototype, "keterlambatan_menit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], TardinessRecord.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], TardinessRecord.prototype, "alasan", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], TardinessRecord.prototype, "bukti_foto", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], TardinessRecord.prototype, "catatan_petugas", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], TardinessRecord.prototype, "has_appeal", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], TardinessRecord.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], TardinessRecord.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], TardinessRecord.prototype, "created_by", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], TardinessRecord.prototype, "verified_by", void 0);
exports.TardinessRecord = TardinessRecord = __decorate([
    (0, typeorm_1.Entity)('tardiness_records'),
    (0, typeorm_1.Index)('idx_tardiness_student_tanggal', ['student_id', 'tanggal'], { unique: true }),
    (0, typeorm_1.Index)('idx_tardiness_class_tanggal', ['class_id', 'tanggal']),
    (0, typeorm_1.Index)('idx_tardiness_student_status', ['student_id', 'status'])
], TardinessRecord);
let TardinessAppeal = class TardinessAppeal {
    id;
    tardiness_record_id;
    student_id;
    alasan_appeal;
    bukti_appeal;
    status;
    catatan_bk;
    is_resolved;
    resolved_by;
    resolved_at;
    created_at;
    updated_at;
};
exports.TardinessAppeal = TardinessAppeal;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TardinessAppeal.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], TardinessAppeal.prototype, "tardiness_record_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], TardinessAppeal.prototype, "student_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], TardinessAppeal.prototype, "alasan_appeal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], TardinessAppeal.prototype, "bukti_appeal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], TardinessAppeal.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], TardinessAppeal.prototype, "catatan_bk", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], TardinessAppeal.prototype, "is_resolved", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], TardinessAppeal.prototype, "resolved_by", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], TardinessAppeal.prototype, "resolved_at", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], TardinessAppeal.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], TardinessAppeal.prototype, "updated_at", void 0);
exports.TardinessAppeal = TardinessAppeal = __decorate([
    (0, typeorm_1.Entity)('tardiness_appeals'),
    (0, typeorm_1.Index)('idx_appeal_record', ['tardiness_record_id']),
    (0, typeorm_1.Index)('idx_appeal_student_status', ['student_id', 'status']),
    (0, typeorm_1.Index)('idx_appeal_resolved', ['is_resolved'])
], TardinessAppeal);
let TardinessSummary = class TardinessSummary {
    id;
    student_id;
    class_id;
    tahun_bulan;
    count_total;
    count_verified;
    count_disputed;
    total_menit;
    threshold_status;
    is_flagged;
    reason_if_flagged;
    created_at;
    updated_at;
};
exports.TardinessSummary = TardinessSummary;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TardinessSummary.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], TardinessSummary.prototype, "student_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], TardinessSummary.prototype, "class_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 7 }),
    __metadata("design:type", String)
], TardinessSummary.prototype, "tahun_bulan", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], TardinessSummary.prototype, "count_total", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], TardinessSummary.prototype, "count_verified", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], TardinessSummary.prototype, "count_disputed", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], TardinessSummary.prototype, "total_menit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], TardinessSummary.prototype, "threshold_status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], TardinessSummary.prototype, "is_flagged", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], TardinessSummary.prototype, "reason_if_flagged", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], TardinessSummary.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], TardinessSummary.prototype, "updated_at", void 0);
exports.TardinessSummary = TardinessSummary = __decorate([
    (0, typeorm_1.Entity)('tardiness_summaries'),
    (0, typeorm_1.Index)('idx_tardsumm_student_month', ['student_id', 'tahun_bulan'], { unique: true }),
    (0, typeorm_1.Index)('idx_tardsumm_flagged', ['is_flagged']),
    (0, typeorm_1.Index)('idx_tardsumm_count_threshold', ['count_total', 'threshold_status'])
], TardinessSummary);
let TardinessAlert = class TardinessAlert {
    id;
    student_id;
    student_name;
    alert_type;
    description;
    severity;
    alert_data;
    is_resolved;
    resolved_by;
    resolved_at;
    created_at;
    updated_at;
};
exports.TardinessAlert = TardinessAlert;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TardinessAlert.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], TardinessAlert.prototype, "student_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], TardinessAlert.prototype, "student_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], TardinessAlert.prototype, "alert_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], TardinessAlert.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], TardinessAlert.prototype, "severity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], TardinessAlert.prototype, "alert_data", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], TardinessAlert.prototype, "is_resolved", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], TardinessAlert.prototype, "resolved_by", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], TardinessAlert.prototype, "resolved_at", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], TardinessAlert.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], TardinessAlert.prototype, "updated_at", void 0);
exports.TardinessAlert = TardinessAlert = __decorate([
    (0, typeorm_1.Entity)('tardiness_alerts'),
    (0, typeorm_1.Index)('idx_tardalert_student_type', ['student_id', 'alert_type']),
    (0, typeorm_1.Index)('idx_tardalert_resolved', ['is_resolved'])
], TardinessAlert);
let TardinessPattern = class TardinessPattern {
    id;
    student_id;
    pattern_type;
    pattern_description;
    confidence_score;
    occurrences;
    created_at;
    updated_at;
};
exports.TardinessPattern = TardinessPattern;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TardinessPattern.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], TardinessPattern.prototype, "student_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], TardinessPattern.prototype, "pattern_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], TardinessPattern.prototype, "pattern_description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float' }),
    __metadata("design:type", Number)
], TardinessPattern.prototype, "confidence_score", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], TardinessPattern.prototype, "occurrences", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], TardinessPattern.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], TardinessPattern.prototype, "updated_at", void 0);
exports.TardinessPattern = TardinessPattern = __decorate([
    (0, typeorm_1.Entity)('tardiness_patterns'),
    (0, typeorm_1.Index)('idx_pattern_student', ['student_id'])
], TardinessPattern);
//# sourceMappingURL=tardiness.entity.js.map