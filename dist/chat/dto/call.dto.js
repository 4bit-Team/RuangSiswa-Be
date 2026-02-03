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
exports.IceCandidateDto = exports.CallEndDto = exports.CallRejectDto = exports.CallAnswerDto = exports.CallOfferDto = exports.CreateCallDto = void 0;
const class_validator_1 = require("class-validator");
const call_entity_1 = require("../entities/call.entity");
class CreateCallDto {
    receiverId;
    conversationId;
    callType;
    offer;
}
exports.CreateCallDto = CreateCallDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateCallDto.prototype, "receiverId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateCallDto.prototype, "conversationId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(call_entity_1.CallType),
    __metadata("design:type", String)
], CreateCallDto.prototype, "callType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCallDto.prototype, "offer", void 0);
class CallOfferDto {
    callId;
    offer;
    iceCandidates;
}
exports.CallOfferDto = CallOfferDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CallOfferDto.prototype, "callId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CallOfferDto.prototype, "offer", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CallOfferDto.prototype, "iceCandidates", void 0);
class CallAnswerDto {
    callId;
    answer;
    iceCandidates;
}
exports.CallAnswerDto = CallAnswerDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CallAnswerDto.prototype, "callId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CallAnswerDto.prototype, "answer", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CallAnswerDto.prototype, "iceCandidates", void 0);
class CallRejectDto {
    callId;
    reason;
}
exports.CallRejectDto = CallRejectDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CallRejectDto.prototype, "callId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CallRejectDto.prototype, "reason", void 0);
class CallEndDto {
    callId;
    duration;
}
exports.CallEndDto = CallEndDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CallEndDto.prototype, "callId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CallEndDto.prototype, "duration", void 0);
class IceCandidateDto {
    callId;
    candidate;
    sdpMLineIndex;
    sdpMid;
}
exports.IceCandidateDto = IceCandidateDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], IceCandidateDto.prototype, "callId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IceCandidateDto.prototype, "candidate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IceCandidateDto.prototype, "sdpMLineIndex", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IceCandidateDto.prototype, "sdpMid", void 0);
//# sourceMappingURL=call.dto.js.map