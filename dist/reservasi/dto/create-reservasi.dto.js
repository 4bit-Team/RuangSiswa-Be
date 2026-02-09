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
exports.UpdateReservasiStatusDto = exports.CreateReservasiDto = void 0;
const class_validator_1 = require("class-validator");
class CreateReservasiDto {
    studentId;
    counselorId;
    preferredDate;
    preferredTime;
    type;
    topicId;
    notes;
    room;
}
exports.CreateReservasiDto = CreateReservasiDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateReservasiDto.prototype, "studentId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateReservasiDto.prototype, "counselorId", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], CreateReservasiDto.prototype, "preferredDate", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateReservasiDto.prototype, "preferredTime", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['chat', 'tatap-muka']),
    __metadata("design:type", String)
], CreateReservasiDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateReservasiDto.prototype, "topicId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateReservasiDto.prototype, "notes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateReservasiDto.prototype, "room", void 0);
class UpdateReservasiStatusDto {
    status;
    rejectionReason;
}
exports.UpdateReservasiStatusDto = UpdateReservasiStatusDto;
__decorate([
    (0, class_validator_1.IsEnum)(['approved', 'rejected', 'in_counseling', 'completed', 'cancelled']),
    __metadata("design:type", String)
], UpdateReservasiStatusDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateReservasiStatusDto.prototype, "rejectionReason", void 0);
//# sourceMappingURL=create-reservasi.dto.js.map