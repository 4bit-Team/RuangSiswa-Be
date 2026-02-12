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
exports.PembinaanOrtu = void 0;
const typeorm_1 = require("typeorm");
const pembinaan_entity_1 = require("../../pembinaan/entities/pembinaan.entity");
const user_entity_1 = require("../../../users/entities/user.entity");
let PembinaanOrtu = class PembinaanOrtu {
    id;
    pembinaan;
    pembinaan_id;
    student_id;
    student_name;
    student_class;
    parent;
    parent_id;
    parent_name;
    parent_phone;
    violation_details;
    letter_content;
    scheduled_date;
    scheduled_time;
    location;
    status;
    kesiswaan_notes;
    parent_response;
    parent_response_date;
    meeting_result;
    meeting_date;
    requires_follow_up;
    follow_up_notes;
    communication_method;
    sent_at;
    read_at;
    createdAt;
    updatedAt;
    closedAt;
};
exports.PembinaanOrtu = PembinaanOrtu;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PembinaanOrtu.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => pembinaan_entity_1.Pembinaan, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'pembinaan_id' }),
    __metadata("design:type", pembinaan_entity_1.Pembinaan)
], PembinaanOrtu.prototype, "pembinaan", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], PembinaanOrtu.prototype, "pembinaan_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], PembinaanOrtu.prototype, "student_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], PembinaanOrtu.prototype, "student_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], PembinaanOrtu.prototype, "student_class", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'parent_id' }),
    __metadata("design:type", user_entity_1.User)
], PembinaanOrtu.prototype, "parent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], PembinaanOrtu.prototype, "parent_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], PembinaanOrtu.prototype, "parent_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", String)
], PembinaanOrtu.prototype, "parent_phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], PembinaanOrtu.prototype, "violation_details", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], PembinaanOrtu.prototype, "letter_content", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], PembinaanOrtu.prototype, "scheduled_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 5, nullable: true }),
    __metadata("design:type", String)
], PembinaanOrtu.prototype, "scheduled_time", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], PembinaanOrtu.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['pending', 'sent', 'read', 'responded', 'closed'], default: 'pending' }),
    __metadata("design:type", String)
], PembinaanOrtu.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], PembinaanOrtu.prototype, "kesiswaan_notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], PembinaanOrtu.prototype, "parent_response", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], PembinaanOrtu.prototype, "parent_response_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], PembinaanOrtu.prototype, "meeting_result", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], PembinaanOrtu.prototype, "meeting_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], PembinaanOrtu.prototype, "requires_follow_up", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PembinaanOrtu.prototype, "follow_up_notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', default: 'sms' }),
    __metadata("design:type", String)
], PembinaanOrtu.prototype, "communication_method", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], PembinaanOrtu.prototype, "sent_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], PembinaanOrtu.prototype, "read_at", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PembinaanOrtu.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], PembinaanOrtu.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], PembinaanOrtu.prototype, "closedAt", void 0);
exports.PembinaanOrtu = PembinaanOrtu = __decorate([
    (0, typeorm_1.Entity)('pembinaan_ortu'),
    (0, typeorm_1.Index)(['pembinaan_id']),
    (0, typeorm_1.Index)(['student_id']),
    (0, typeorm_1.Index)(['parent_id']),
    (0, typeorm_1.Index)(['status'])
], PembinaanOrtu);
//# sourceMappingURL=pembinaan-ortu.entity.js.map