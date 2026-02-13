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
exports.Keterlambatan = void 0;
const typeorm_1 = require("typeorm");
let Keterlambatan = class Keterlambatan {
    id;
    studentId;
    studentName;
    className;
    date;
    time;
    minutesLate;
    reason;
    status;
    walasId;
    walasName;
    verificationNotes;
    createdAt;
    updatedAt;
    source;
};
exports.Keterlambatan = Keterlambatan;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Keterlambatan.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Keterlambatan.prototype, "studentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Keterlambatan.prototype, "studentName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], Keterlambatan.prototype, "className", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", String)
], Keterlambatan.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'time' }),
    __metadata("design:type", String)
], Keterlambatan.prototype, "time", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Keterlambatan.prototype, "minutesLate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], Keterlambatan.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['recorded', 'verified', 'appealed', 'resolved'],
        default: 'recorded',
    }),
    __metadata("design:type", String)
], Keterlambatan.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Keterlambatan.prototype, "walasId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], Keterlambatan.prototype, "walasName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Keterlambatan.prototype, "verificationNotes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Keterlambatan.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Keterlambatan.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: 'sync' }),
    __metadata("design:type", String)
], Keterlambatan.prototype, "source", void 0);
exports.Keterlambatan = Keterlambatan = __decorate([
    (0, typeorm_1.Entity)('keterlambatan'),
    (0, typeorm_1.Index)(['studentId', 'date']),
    (0, typeorm_1.Index)(['className']),
    (0, typeorm_1.Index)(['date']),
    (0, typeorm_1.Index)(['status'])
], Keterlambatan);
//# sourceMappingURL=keterlambatan.entity.js.map