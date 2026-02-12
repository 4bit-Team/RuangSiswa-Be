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
exports.UpdateGroupReservasiStatusDto = exports.CreateGroupReservasiDto = void 0;
const class_validator_1 = require("class-validator");
const session_type_enum_1 = require("../enums/session-type.enum");
const reservasi_status_enum_1 = require("../enums/reservasi-status.enum");
class CreateGroupReservasiDto {
    groupName;
    creatorId;
    studentIds;
    counselorId;
    preferredDate;
    preferredTime;
    type;
    topicId;
    notes;
    room;
}
exports.CreateGroupReservasiDto = CreateGroupReservasiDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGroupReservasiDto.prototype, "groupName", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateGroupReservasiDto.prototype, "creatorId", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNumber)({}, { each: true }),
    __metadata("design:type", Array)
], CreateGroupReservasiDto.prototype, "studentIds", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateGroupReservasiDto.prototype, "counselorId", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], CreateGroupReservasiDto.prototype, "preferredDate", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGroupReservasiDto.prototype, "preferredTime", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(session_type_enum_1.SessionType),
    __metadata("design:type", String)
], CreateGroupReservasiDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateGroupReservasiDto.prototype, "topicId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGroupReservasiDto.prototype, "notes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGroupReservasiDto.prototype, "room", void 0);
class UpdateGroupReservasiStatusDto {
    status;
    rejectionReason;
}
exports.UpdateGroupReservasiStatusDto = UpdateGroupReservasiStatusDto;
__decorate([
    (0, class_validator_1.IsEnum)(reservasi_status_enum_1.ReservasiStatus),
    __metadata("design:type", String)
], UpdateGroupReservasiStatusDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateGroupReservasiStatusDto.prototype, "rejectionReason", void 0);
//# sourceMappingURL=create-group-reservasi.dto.js.map