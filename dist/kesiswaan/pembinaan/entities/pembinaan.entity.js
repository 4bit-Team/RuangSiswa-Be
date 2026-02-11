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
exports.Pembinaan = void 0;
const typeorm_1 = require("typeorm");
const point_pelanggaran_entity_1 = require("../../point-pelanggaran/entities/point-pelanggaran.entity");
let Pembinaan = class Pembinaan {
    id;
    walas_id;
    walas_name;
    siswas_id;
    siswas_name;
    point_pelanggaran_id;
    pointPelanggaran;
    kasus;
    tindak_lanjut;
    keterangan;
    tanggal_pembinaan;
    status;
    match_type;
    match_confidence;
    match_explanation;
    class_id;
    class_name;
    hasil_pembinaan;
    catatan_bk;
    follow_up_type;
    follow_up_date;
    createdAt;
    updatedAt;
};
exports.Pembinaan = Pembinaan;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Pembinaan.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Pembinaan.prototype, "walas_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Pembinaan.prototype, "walas_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Pembinaan.prototype, "siswas_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Pembinaan.prototype, "siswas_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Pembinaan.prototype, "point_pelanggaran_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => point_pelanggaran_entity_1.PointPelanggaran, { nullable: true, eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'point_pelanggaran_id' }),
    __metadata("design:type", point_pelanggaran_entity_1.PointPelanggaran)
], Pembinaan.prototype, "pointPelanggaran", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Pembinaan.prototype, "kasus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Pembinaan.prototype, "tindak_lanjut", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Pembinaan.prototype, "keterangan", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", String)
], Pembinaan.prototype, "tanggal_pembinaan", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, default: 'pending' }),
    __metadata("design:type", String)
], Pembinaan.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], Pembinaan.prototype, "match_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Pembinaan.prototype, "match_confidence", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Pembinaan.prototype, "match_explanation", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", Number)
], Pembinaan.prototype, "class_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], Pembinaan.prototype, "class_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Pembinaan.prototype, "hasil_pembinaan", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Pembinaan.prototype, "catatan_bk", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], Pembinaan.prototype, "follow_up_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", String)
], Pembinaan.prototype, "follow_up_date", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Pembinaan.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Pembinaan.prototype, "updatedAt", void 0);
exports.Pembinaan = Pembinaan = __decorate([
    (0, typeorm_1.Entity)('pembinaan'),
    (0, typeorm_1.Index)(['siswas_id']),
    (0, typeorm_1.Index)(['walas_id']),
    (0, typeorm_1.Index)(['point_pelanggaran_id']),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['tanggal_pembinaan', 'siswas_id'])
], Pembinaan);
//# sourceMappingURL=pembinaan.entity.js.map