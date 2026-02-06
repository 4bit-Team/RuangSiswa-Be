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
exports.ViolationStatistics = exports.ViolationExcuse = exports.SpProgression = exports.SpLetter = exports.Violation = exports.ViolationCategory = void 0;
const typeorm_1 = require("typeorm");
let ViolationCategory = class ViolationCategory {
    id;
    name;
    code;
    description;
    sp_trigger_count;
    is_active;
    created_at;
    updated_at;
};
exports.ViolationCategory = ViolationCategory;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ViolationCategory.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], ViolationCategory.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], ViolationCategory.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], ViolationCategory.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], ViolationCategory.prototype, "sp_trigger_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], ViolationCategory.prototype, "is_active", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ViolationCategory.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ViolationCategory.prototype, "updated_at", void 0);
exports.ViolationCategory = ViolationCategory = __decorate([
    (0, typeorm_1.Entity)('violation_categories')
], ViolationCategory);
let Violation = class Violation {
    id;
    student_id;
    student_name;
    class_id;
    violation_category_id;
    description;
    bukti_foto;
    catatan_petugas;
    severity;
    is_processed;
    sp_letter_id;
    tanggal_pelanggaran;
    created_at;
    updated_at;
    created_by;
};
exports.Violation = Violation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Violation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Violation.prototype, "student_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Violation.prototype, "student_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Violation.prototype, "class_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], Violation.prototype, "violation_category_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Violation.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], Violation.prototype, "bukti_foto", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Violation.prototype, "catatan_petugas", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], Violation.prototype, "severity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Violation.prototype, "is_processed", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Violation.prototype, "sp_letter_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", String)
], Violation.prototype, "tanggal_pelanggaran", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Violation.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Violation.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], Violation.prototype, "created_by", void 0);
exports.Violation = Violation = __decorate([
    (0, typeorm_1.Entity)('violations'),
    (0, typeorm_1.Index)('idx_violation_student_created', ['student_id', 'created_at']),
    (0, typeorm_1.Index)('idx_violation_student_category', ['student_id', 'violation_category_id']),
    (0, typeorm_1.Index)('idx_violation_processed', ['is_processed'])
], Violation);
let SpLetter = class SpLetter {
    id;
    student_id;
    student_name;
    class_id;
    nis;
    sp_level;
    sp_number;
    sp_type;
    tahun;
    violations_text;
    violation_ids;
    consequences;
    alamat_siswa;
    kompetensi_keahlian;
    tanggal_sp;
    status;
    is_signed;
    signed_date;
    signed_by_parent;
    signed_by_bp_bk;
    signed_by_wali_kelas;
    material_cost;
    pdf_path;
    notes;
    created_at;
    updated_at;
};
exports.SpLetter = SpLetter;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SpLetter.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], SpLetter.prototype, "student_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], SpLetter.prototype, "student_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], SpLetter.prototype, "class_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], SpLetter.prototype, "nis", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], SpLetter.prototype, "sp_level", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], SpLetter.prototype, "sp_number", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], SpLetter.prototype, "sp_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], SpLetter.prototype, "tahun", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], SpLetter.prototype, "violations_text", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], SpLetter.prototype, "violation_ids", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], SpLetter.prototype, "consequences", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], SpLetter.prototype, "alamat_siswa", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], SpLetter.prototype, "kompetensi_keahlian", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", String)
], SpLetter.prototype, "tanggal_sp", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], SpLetter.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], SpLetter.prototype, "is_signed", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", String)
], SpLetter.prototype, "signed_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], SpLetter.prototype, "signed_by_parent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], SpLetter.prototype, "signed_by_bp_bk", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], SpLetter.prototype, "signed_by_wali_kelas", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], SpLetter.prototype, "material_cost", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], SpLetter.prototype, "pdf_path", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], SpLetter.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SpLetter.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], SpLetter.prototype, "updated_at", void 0);
exports.SpLetter = SpLetter = __decorate([
    (0, typeorm_1.Entity)('sp_letters'),
    (0, typeorm_1.Index)('idx_sp_student_level', ['student_id', 'sp_level']),
    (0, typeorm_1.Index)('idx_sp_student_tahun', ['student_id', 'tahun']),
    (0, typeorm_1.Index)('idx_sp_status', ['status']),
    (0, typeorm_1.Index)('idx_sp_signed', ['is_signed'])
], SpLetter);
let SpProgression = class SpProgression {
    id;
    student_id;
    tahun;
    current_sp_level;
    violation_count;
    sp1_issued_count;
    sp2_issued_count;
    sp3_issued_count;
    first_sp_date;
    last_sp_date;
    is_expelled;
    expulsion_date;
    reason_if_expelled;
    notes;
    created_at;
    updated_at;
};
exports.SpProgression = SpProgression;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SpProgression.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], SpProgression.prototype, "student_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], SpProgression.prototype, "tahun", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], SpProgression.prototype, "current_sp_level", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], SpProgression.prototype, "violation_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], SpProgression.prototype, "sp1_issued_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], SpProgression.prototype, "sp2_issued_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], SpProgression.prototype, "sp3_issued_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", String)
], SpProgression.prototype, "first_sp_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", String)
], SpProgression.prototype, "last_sp_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], SpProgression.prototype, "is_expelled", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", String)
], SpProgression.prototype, "expulsion_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], SpProgression.prototype, "reason_if_expelled", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], SpProgression.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SpProgression.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], SpProgression.prototype, "updated_at", void 0);
exports.SpProgression = SpProgression = __decorate([
    (0, typeorm_1.Entity)('sp_progressions'),
    (0, typeorm_1.Index)('idx_spprog_student_tahun', ['student_id', 'tahun'], { unique: true }),
    (0, typeorm_1.Index)('idx_spprog_level', ['current_sp_level'])
], SpProgression);
let ViolationExcuse = class ViolationExcuse {
    id;
    violation_id;
    student_id;
    excuse_text;
    bukti_excuse;
    status;
    catatan_bk;
    is_resolved;
    resolved_by;
    resolved_at;
    created_at;
    updated_at;
};
exports.ViolationExcuse = ViolationExcuse;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ViolationExcuse.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], ViolationExcuse.prototype, "violation_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], ViolationExcuse.prototype, "student_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], ViolationExcuse.prototype, "excuse_text", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], ViolationExcuse.prototype, "bukti_excuse", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], ViolationExcuse.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ViolationExcuse.prototype, "catatan_bk", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], ViolationExcuse.prototype, "is_resolved", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], ViolationExcuse.prototype, "resolved_by", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], ViolationExcuse.prototype, "resolved_at", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ViolationExcuse.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ViolationExcuse.prototype, "updated_at", void 0);
exports.ViolationExcuse = ViolationExcuse = __decorate([
    (0, typeorm_1.Entity)('violation_excuses'),
    (0, typeorm_1.Index)('idx_excuse_violation', ['violation_id']),
    (0, typeorm_1.Index)('idx_excuse_student_status', ['student_id', 'status'])
], ViolationExcuse);
let ViolationStatistics = class ViolationStatistics {
    id;
    student_id;
    tahun;
    total_violations;
    total_severity_score;
    average_severity;
    sp_count;
    risk_level;
    most_common_violation;
    created_at;
    updated_at;
};
exports.ViolationStatistics = ViolationStatistics;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ViolationStatistics.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], ViolationStatistics.prototype, "student_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], ViolationStatistics.prototype, "tahun", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], ViolationStatistics.prototype, "total_violations", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], ViolationStatistics.prototype, "total_severity_score", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', default: 0 }),
    __metadata("design:type", Number)
], ViolationStatistics.prototype, "average_severity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], ViolationStatistics.prototype, "sp_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: 'green' }),
    __metadata("design:type", String)
], ViolationStatistics.prototype, "risk_level", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ViolationStatistics.prototype, "most_common_violation", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ViolationStatistics.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ViolationStatistics.prototype, "updated_at", void 0);
exports.ViolationStatistics = ViolationStatistics = __decorate([
    (0, typeorm_1.Entity)('violation_statistics'),
    (0, typeorm_1.Index)('idx_vstat_student_tahun', ['student_id', 'tahun'], { unique: true }),
    (0, typeorm_1.Index)('idx_vstat_total', ['total_violations'])
], ViolationStatistics);
//# sourceMappingURL=violation.entity.js.map