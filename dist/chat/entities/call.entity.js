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
exports.Call = exports.CallType = exports.CallStatus = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
var CallStatus;
(function (CallStatus) {
    CallStatus["INITIATED"] = "initiated";
    CallStatus["RINGING"] = "ringing";
    CallStatus["ACCEPTED"] = "accepted";
    CallStatus["ACTIVE"] = "active";
    CallStatus["ENDED"] = "ended";
    CallStatus["REJECTED"] = "rejected";
    CallStatus["MISSED"] = "missed";
    CallStatus["FAILED"] = "failed";
})(CallStatus || (exports.CallStatus = CallStatus = {}));
var CallType;
(function (CallType) {
    CallType["AUDIO"] = "audio";
    CallType["VIDEO"] = "video";
})(CallType || (exports.CallType = CallType = {}));
let Call = class Call {
    id;
    conversationId;
    callType;
    status;
    callerId;
    caller;
    receiverId;
    receiver;
    ringingStartedAt;
    acceptedAt;
    endedAt;
    duration;
    rejectionReason;
    iceCandidates;
    callerOffer;
    receiverAnswer;
    createdAt;
    updatedAt;
};
exports.Call = Call;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Call.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'conversation_id', nullable: false }),
    __metadata("design:type", Number)
], Call.prototype, "conversationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: CallType }),
    __metadata("design:type", String)
], Call.prototype, "callType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: CallStatus, default: CallStatus.INITIATED }),
    __metadata("design:type", String)
], Call.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'caller_id', nullable: false }),
    __metadata("design:type", Number)
], Call.prototype, "callerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.initiatedCalls, {
        nullable: false,
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'caller_id' }),
    __metadata("design:type", user_entity_1.User)
], Call.prototype, "caller", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'receiver_id', nullable: false }),
    __metadata("design:type", Number)
], Call.prototype, "receiverId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.receivedCalls, {
        nullable: false,
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'receiver_id' }),
    __metadata("design:type", user_entity_1.User)
], Call.prototype, "receiver", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Call.prototype, "ringingStartedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Call.prototype, "acceptedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Call.prototype, "endedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Call.prototype, "duration", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Call.prototype, "rejectionReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], Call.prototype, "iceCandidates", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Call.prototype, "callerOffer", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Call.prototype, "receiverAnswer", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Call.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Call.prototype, "updatedAt", void 0);
exports.Call = Call = __decorate([
    (0, typeorm_1.Entity)('calls'),
    (0, typeorm_1.Index)(['callerId', 'status']),
    (0, typeorm_1.Index)(['receiverId', 'status']),
    (0, typeorm_1.Index)(['conversationId', 'createdAt']),
    (0, typeorm_1.Index)(['status', 'createdAt']),
    (0, typeorm_1.Check)(`"caller_id" != "receiver_id"`)
], Call);
//# sourceMappingURL=call.entity.js.map