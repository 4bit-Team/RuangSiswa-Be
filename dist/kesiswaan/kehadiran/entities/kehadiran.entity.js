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
exports.Kehadiran = void 0;
const typeorm_1 = require("typeorm");
let Kehadiran = class Kehadiran {
    id;
    studentId;
    studentName;
    className;
    date;
    status;
    time;
    notes;
    walasId;
    walasName;
    createdAt;
    updatedAt;
    source;
};
exports.Kehadiran = Kehadiran;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Kehadiran.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Kehadiran.prototype, "studentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Kehadiran.prototype, "studentName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], Kehadiran.prototype, "className", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", String)
], Kehadiran.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['Hadir', 'Sakit', 'Izin', 'Alpa'],
        default: 'Hadir',
    }),
    __metadata("design:type", String)
], Kehadiran.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'time', nullable: true }),
    __metadata("design:type", String)
], Kehadiran.prototype, "time", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], Kehadiran.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Kehadiran.prototype, "walasId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], Kehadiran.prototype, "walasName", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Kehadiran.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Kehadiran.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: 'sync' }),
    __metadata("design:type", String)
], Kehadiran.prototype, "source", void 0);
exports.Kehadiran = Kehadiran = __decorate([
    (0, typeorm_1.Entity)('kehadiran'),
    (0, typeorm_1.Index)(['studentId', 'date']),
    (0, typeorm_1.Index)(['className']),
    (0, typeorm_1.Index)(['date']),
    (0, typeorm_1.Index)(['status'])
], Kehadiran);
//# sourceMappingURL=kehadiran.entity.js.map