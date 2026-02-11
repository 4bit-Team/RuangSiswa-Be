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
exports.CompleteFollowUpDto = exports.EscalateToBkDto = exports.RecordSessionDto = exports.UpdateLaporanBkDto = exports.CreateLaporanBkDto = void 0;
const class_validator_1 = require("class-validator");
class CreateLaporanBkDto {
    reservasi_id;
    pembinaan_id;
    student_id;
    student_name;
    student_class;
    bk_id;
    session_date;
    session_duration_minutes;
    session_type;
    session_location;
    session_topic;
    session_notes;
}
exports.CreateLaporanBkDto = CreateLaporanBkDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateLaporanBkDto.prototype, "reservasi_id", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateLaporanBkDto.prototype, "pembinaan_id", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateLaporanBkDto.prototype, "student_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLaporanBkDto.prototype, "student_name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLaporanBkDto.prototype, "student_class", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateLaporanBkDto.prototype, "bk_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateLaporanBkDto.prototype, "session_date", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateLaporanBkDto.prototype, "session_duration_minutes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['individu', 'kelompok', 'keluarga']),
    __metadata("design:type", String)
], CreateLaporanBkDto.prototype, "session_type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLaporanBkDto.prototype, "session_location", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLaporanBkDto.prototype, "session_topic", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLaporanBkDto.prototype, "session_notes", void 0);
class UpdateLaporanBkDto {
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
    status;
    final_assessment;
    internal_notes;
}
exports.UpdateLaporanBkDto = UpdateLaporanBkDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateLaporanBkDto.prototype, "session_date", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateLaporanBkDto.prototype, "session_duration_minutes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['individu', 'kelompok', 'keluarga']),
    __metadata("design:type", String)
], UpdateLaporanBkDto.prototype, "session_type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLaporanBkDto.prototype, "session_location", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLaporanBkDto.prototype, "session_topic", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLaporanBkDto.prototype, "session_notes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLaporanBkDto.prototype, "student_response", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['sangat_memahami', 'memahami', 'cukup', 'kurang']),
    __metadata("design:type", String)
], UpdateLaporanBkDto.prototype, "student_understanding_level", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['sangat_aktif', 'aktif', 'cukup', 'pasif']),
    __metadata("design:type", String)
], UpdateLaporanBkDto.prototype, "student_participation_level", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateLaporanBkDto.prototype, "behavioral_improvement", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLaporanBkDto.prototype, "recommendations", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateLaporanBkDto.prototype, "follow_up_date", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLaporanBkDto.prototype, "follow_up_status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateLaporanBkDto.prototype, "parent_notified", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateLaporanBkDto.prototype, "parent_notification_date", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLaporanBkDto.prototype, "parent_notification_content", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateLaporanBkDto.prototype, "escalated_to_waka", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLaporanBkDto.prototype, "escalation_reason", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['ongoing', 'completed', 'needs_escalation', 'archived']),
    __metadata("design:type", String)
], UpdateLaporanBkDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLaporanBkDto.prototype, "final_assessment", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLaporanBkDto.prototype, "internal_notes", void 0);
class RecordSessionDto {
    session_date;
    session_duration_minutes;
    session_type;
    session_location;
    session_topic;
    session_notes;
    student_response;
    student_understanding_level;
    student_participation_level;
    recommendations;
    follow_up_date;
}
exports.RecordSessionDto = RecordSessionDto;
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], RecordSessionDto.prototype, "session_date", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RecordSessionDto.prototype, "session_duration_minutes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['individu', 'kelompok', 'keluarga']),
    __metadata("design:type", String)
], RecordSessionDto.prototype, "session_type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordSessionDto.prototype, "session_location", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordSessionDto.prototype, "session_topic", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordSessionDto.prototype, "session_notes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordSessionDto.prototype, "student_response", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['sangat_memahami', 'memahami', 'cukup', 'kurang']),
    __metadata("design:type", String)
], RecordSessionDto.prototype, "student_understanding_level", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['sangat_aktif', 'aktif', 'cukup', 'pasif']),
    __metadata("design:type", String)
], RecordSessionDto.prototype, "student_participation_level", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordSessionDto.prototype, "recommendations", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], RecordSessionDto.prototype, "follow_up_date", void 0);
class EscalateToBkDto {
    escalation_reason;
    final_assessment;
}
exports.EscalateToBkDto = EscalateToBkDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EscalateToBkDto.prototype, "escalation_reason", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EscalateToBkDto.prototype, "final_assessment", void 0);
class CompleteFollowUpDto {
    follow_up_status;
    follow_up_notes;
}
exports.CompleteFollowUpDto = CompleteFollowUpDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CompleteFollowUpDto.prototype, "follow_up_status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CompleteFollowUpDto.prototype, "follow_up_notes", void 0);
//# sourceMappingURL=create-laporan-bk.dto.js.map