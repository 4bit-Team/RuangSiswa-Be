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
exports.PointPelanggaran = void 0;
const typeorm_1 = require("typeorm");
let PointPelanggaran = class PointPelanggaran {
    id;
    tahun_point;
    category_point;
    nama_pelanggaran;
    kode;
    bobot;
    isActive;
    isSanksi;
    isDo;
    deskripsi;
    createdAt;
    updatedAt;
};
exports.PointPelanggaran = PointPelanggaran;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PointPelanggaran.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], PointPelanggaran.prototype, "tahun_point", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], PointPelanggaran.prototype, "category_point", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], PointPelanggaran.prototype, "nama_pelanggaran", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', unique: true }),
    __metadata("design:type", Number)
], PointPelanggaran.prototype, "kode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], PointPelanggaran.prototype, "bobot", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], PointPelanggaran.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], PointPelanggaran.prototype, "isSanksi", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], PointPelanggaran.prototype, "isDo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], PointPelanggaran.prototype, "deskripsi", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PointPelanggaran.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], PointPelanggaran.prototype, "updatedAt", void 0);
exports.PointPelanggaran = PointPelanggaran = __decorate([
    (0, typeorm_1.Entity)('point_pelanggaran'),
    (0, typeorm_1.Index)(['tahun_point', 'isActive']),
    (0, typeorm_1.Index)(['category_point']),
    (0, typeorm_1.Index)(['kode'])
], PointPelanggaran);
//# sourceMappingURL=point-pelanggaran.entity.js.map