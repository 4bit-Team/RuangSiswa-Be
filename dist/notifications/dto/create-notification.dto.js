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
exports.BulkMarkAsReadDto = exports.MarkAsReadDto = exports.CreateNotificationDto = void 0;
const class_validator_1 = require("class-validator");
class CreateNotificationDto {
    recipient_id;
    type;
    title;
    message;
    related_id;
    related_type;
    metadata;
}
exports.CreateNotificationDto = CreateNotificationDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateNotificationDto.prototype, "recipient_id", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['reservasi_approved', 'reservasi_rejected', 'session_recorded', 'escalation_to_waka', 'decision_made', 'parent_notification', 'general']),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "message", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateNotificationDto.prototype, "related_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "related_type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateNotificationDto.prototype, "metadata", void 0);
class MarkAsReadDto {
    notification_id;
}
exports.MarkAsReadDto = MarkAsReadDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], MarkAsReadDto.prototype, "notification_id", void 0);
class BulkMarkAsReadDto {
    is_all;
}
exports.BulkMarkAsReadDto = BulkMarkAsReadDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], BulkMarkAsReadDto.prototype, "is_all", void 0);
//# sourceMappingURL=create-notification.dto.js.map