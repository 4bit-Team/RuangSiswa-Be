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
exports.AttendanceAlert = void 0;
const typeorm_1 = require("typeorm");
let AttendanceAlert = class AttendanceAlert {
    id;
    student_id;
    alert_type;
    description;
    severity;
    is_resolved;
    resolved_by;
    resolved_at;
    created_at;
};
exports.AttendanceAlert = AttendanceAlert;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], AttendanceAlert.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], AttendanceAlert.prototype, "student_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['high_alpa', 'low_attendance', 'pattern_change'] }),
    __metadata("design:type", String)
], AttendanceAlert.prototype, "alert_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], AttendanceAlert.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['warning', 'critical'], default: 'warning' }),
    __metadata("design:type", String)
], AttendanceAlert.prototype, "severity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], AttendanceAlert.prototype, "is_resolved", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], AttendanceAlert.prototype, "resolved_by", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], AttendanceAlert.prototype, "resolved_at", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], AttendanceAlert.prototype, "created_at", void 0);
exports.AttendanceAlert = AttendanceAlert = __decorate([
    (0, typeorm_1.Entity)('attendance_alerts'),
    (0, typeorm_1.Index)('idx_alert_student_type', ['student_id', 'alert_type']),
    (0, typeorm_1.Index)('idx_alert_resolved', ['is_resolved'])
], AttendanceAlert);
//# sourceMappingURL=attendance.entity.js.map