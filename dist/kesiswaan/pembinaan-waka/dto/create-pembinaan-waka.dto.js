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
exports.UpdatePembinaanWakaDto = exports.NotifyParentDto = exports.AppealPembinaanWakaDto = exports.AcknowledgePembinaanWakaDto = exports.DecidePembinaanWakaDto = exports.CreatePembinaanWakaDto = void 0;
const class_validator_1 = require("class-validator");
class CreatePembinaanWakaDto {
    reservasi_id;
    pembinaan_id;
    waka_id;
    notes;
}
exports.CreatePembinaanWakaDto = CreatePembinaanWakaDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreatePembinaanWakaDto.prototype, "reservasi_id", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreatePembinaanWakaDto.prototype, "pembinaan_id", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreatePembinaanWakaDto.prototype, "waka_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePembinaanWakaDto.prototype, "notes", void 0);
class DecidePembinaanWakaDto {
    wak_decision;
    decision_reason;
    notes;
}
exports.DecidePembinaanWakaDto = DecidePembinaanWakaDto;
__decorate([
    (0, class_validator_1.IsEnum)(['sp3', 'do']),
    __metadata("design:type", String)
], DecidePembinaanWakaDto.prototype, "wak_decision", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DecidePembinaanWakaDto.prototype, "decision_reason", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DecidePembinaanWakaDto.prototype, "notes", void 0);
class AcknowledgePembinaanWakaDto {
    acknowledged;
    student_response;
}
exports.AcknowledgePembinaanWakaDto = AcknowledgePembinaanWakaDto;
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AcknowledgePembinaanWakaDto.prototype, "acknowledged", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AcknowledgePembinaanWakaDto.prototype, "student_response", void 0);
class AppealPembinaanWakaDto {
    appeal_reason;
    additional_notes;
}
exports.AppealPembinaanWakaDto = AppealPembinaanWakaDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AppealPembinaanWakaDto.prototype, "appeal_reason", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AppealPembinaanWakaDto.prototype, "additional_notes", void 0);
class NotifyParentDto {
    notification_message;
}
exports.NotifyParentDto = NotifyParentDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], NotifyParentDto.prototype, "notification_message", void 0);
class UpdatePembinaanWakaDto {
    notes;
    parent_notified;
    parent_notification_date;
}
exports.UpdatePembinaanWakaDto = UpdatePembinaanWakaDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePembinaanWakaDto.prototype, "notes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdatePembinaanWakaDto.prototype, "parent_notified", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdatePembinaanWakaDto.prototype, "parent_notification_date", void 0);
//# sourceMappingURL=create-pembinaan-waka.dto.js.map