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
exports.UpdateBkScheduleDto = exports.CreateBkScheduleDto = void 0;
const class_validator_1 = require("class-validator");
class CreateBkScheduleDto {
    bkId;
    sessionType;
    daySchedules;
    isActive;
}
exports.CreateBkScheduleDto = CreateBkScheduleDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateBkScheduleDto.prototype, "bkId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['tatap-muka', 'chat']),
    __metadata("design:type", String)
], CreateBkScheduleDto.prototype, "sessionType", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateBkScheduleDto.prototype, "daySchedules", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateBkScheduleDto.prototype, "isActive", void 0);
class UpdateBkScheduleDto {
    sessionType;
    daySchedules;
    isActive;
}
exports.UpdateBkScheduleDto = UpdateBkScheduleDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['tatap-muka', 'chat']),
    __metadata("design:type", String)
], UpdateBkScheduleDto.prototype, "sessionType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], UpdateBkScheduleDto.prototype, "daySchedules", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateBkScheduleDto.prototype, "isActive", void 0);
//# sourceMappingURL=create-bk-schedule.dto.js.map