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
exports.AttendanceSummary = void 0;
const typeorm_1 = require("typeorm");
let AttendanceSummary = class AttendanceSummary {
    id;
    student_id;
    class_id;
    tahun_bulan;
    total_hadir;
    total_sakit;
    total_izin;
    total_alpa;
    total_days_expected;
    attendance_percentage;
    is_flagged;
    reason_if_flagged;
    created_at;
    updated_at;
};
exports.AttendanceSummary = AttendanceSummary;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], AttendanceSummary.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], AttendanceSummary.prototype, "student_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], AttendanceSummary.prototype, "class_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 7 }),
    __metadata("design:type", String)
], AttendanceSummary.prototype, "tahun_bulan", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], AttendanceSummary.prototype, "total_hadir", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], AttendanceSummary.prototype, "total_sakit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], AttendanceSummary.prototype, "total_izin", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], AttendanceSummary.prototype, "total_alpa", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], AttendanceSummary.prototype, "total_days_expected", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2 }),
    __metadata("design:type", Number)
], AttendanceSummary.prototype, "attendance_percentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], AttendanceSummary.prototype, "is_flagged", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], AttendanceSummary.prototype, "reason_if_flagged", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], AttendanceSummary.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], AttendanceSummary.prototype, "updated_at", void 0);
exports.AttendanceSummary = AttendanceSummary = __decorate([
    (0, typeorm_1.Entity)('attendance_summaries'),
    (0, typeorm_1.Index)('idx_attendance_summary_student_tahun', ['student_id', 'tahun_bulan'], { unique: true })
], AttendanceSummary);
//# sourceMappingURL=attendance-summary.entity.js.map