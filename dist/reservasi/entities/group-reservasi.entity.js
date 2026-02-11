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
exports.GroupReservasi = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const counseling_category_entity_1 = require("../../counseling-category/entities/counseling-category.entity");
const reservasi_status_enum_1 = require("../enums/reservasi-status.enum");
const session_type_enum_1 = require("../enums/session-type.enum");
let GroupReservasi = class GroupReservasi {
    id;
    groupName;
    creatorId;
    creator;
    students;
    counselorId;
    counselor;
    preferredDate;
    preferredTime;
    type;
    topic;
    topicId;
    notes;
    status;
    conversationId;
    rejectionReason;
    room;
    qrCode;
    qrGeneratedAt;
    attendanceConfirmed;
    completedAt;
    chatInitializedAt;
    createdAt;
    updatedAt;
};
exports.GroupReservasi = GroupReservasi;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], GroupReservasi.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], GroupReservasi.prototype, "groupName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], GroupReservasi.prototype, "creatorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { eager: false }),
    (0, typeorm_1.JoinColumn)({ name: 'creatorId' }),
    __metadata("design:type", user_entity_1.User)
], GroupReservasi.prototype, "creator", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => user_entity_1.User),
    (0, typeorm_1.JoinTable)({
        name: 'group_reservasi_students',
        joinColumn: { name: 'groupReservasiId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'studentId', referencedColumnName: 'id' },
    }),
    __metadata("design:type", Array)
], GroupReservasi.prototype, "students", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], GroupReservasi.prototype, "counselorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { eager: false }),
    (0, typeorm_1.JoinColumn)({ name: 'counselorId' }),
    __metadata("design:type", user_entity_1.User)
], GroupReservasi.prototype, "counselor", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], GroupReservasi.prototype, "preferredDate", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], GroupReservasi.prototype, "preferredTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ enum: session_type_enum_1.SessionType, default: session_type_enum_1.SessionType.CHAT }),
    __metadata("design:type", String)
], GroupReservasi.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => counseling_category_entity_1.CounselingCategory, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'topicId' }),
    __metadata("design:type", counseling_category_entity_1.CounselingCategory)
], GroupReservasi.prototype, "topic", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], GroupReservasi.prototype, "topicId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], GroupReservasi.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ enum: reservasi_status_enum_1.ReservasiStatus, default: reservasi_status_enum_1.ReservasiStatus.PENDING }),
    __metadata("design:type", String)
], GroupReservasi.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], GroupReservasi.prototype, "conversationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], GroupReservasi.prototype, "rejectionReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], GroupReservasi.prototype, "room", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], GroupReservasi.prototype, "qrCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], GroupReservasi.prototype, "qrGeneratedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], GroupReservasi.prototype, "attendanceConfirmed", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], GroupReservasi.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], GroupReservasi.prototype, "chatInitializedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], GroupReservasi.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], GroupReservasi.prototype, "updatedAt", void 0);
exports.GroupReservasi = GroupReservasi = __decorate([
    (0, typeorm_1.Entity)('group_reservasi')
], GroupReservasi);
//# sourceMappingURL=group-reservasi.entity.js.map