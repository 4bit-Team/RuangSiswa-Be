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
exports.LaporanBk = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const kelas_entity_1 = require("../../kelas/entities/kelas.entity");
const jurusan_entity_1 = require("../../jurusan/entities/jurusan.entity");
let LaporanBk = class LaporanBk {
    id;
    namaKonseling;
    jurusanId;
    kelasId;
    tanggalDiprosesAiBk;
    deskripsiKasusMasalah;
    bentukPenanganganSebelumnya;
    riwayatSpDanKasus;
    layananBk;
    followUpTindakanBk;
    penahanganGuruBkKonselingProsesPembinaan;
    pertemuanKe1;
    pertemuanKe2;
    pertemuanKe3;
    hasilPemantauanKeterangan;
    guruBkYangMenanganiId;
    statusPerkembanganPesertaDidik;
    keteranganKetersedianDokumen;
    jurusan;
    kelas;
    guruBkYangMenanganis;
    createdAt;
    updatedAt;
};
exports.LaporanBk = LaporanBk;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], LaporanBk.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], LaporanBk.prototype, "namaKonseling", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], LaporanBk.prototype, "jurusanId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], LaporanBk.prototype, "kelasId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], LaporanBk.prototype, "tanggalDiprosesAiBk", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], LaporanBk.prototype, "deskripsiKasusMasalah", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], LaporanBk.prototype, "bentukPenanganganSebelumnya", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], LaporanBk.prototype, "riwayatSpDanKasus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], LaporanBk.prototype, "layananBk", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], LaporanBk.prototype, "followUpTindakanBk", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], LaporanBk.prototype, "penahanganGuruBkKonselingProsesPembinaan", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], LaporanBk.prototype, "pertemuanKe1", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], LaporanBk.prototype, "pertemuanKe2", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], LaporanBk.prototype, "pertemuanKe3", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], LaporanBk.prototype, "hasilPemantauanKeterangan", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], LaporanBk.prototype, "guruBkYangMenanganiId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['Membaik', 'Stabil', 'Menurun', 'Belum Terlihat Perubahan'],
        nullable: true,
    }),
    __metadata("design:type", String)
], LaporanBk.prototype, "statusPerkembanganPesertaDidik", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], LaporanBk.prototype, "keteranganKetersedianDokumen", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => jurusan_entity_1.Jurusan, { eager: true, nullable: true }),
    __metadata("design:type", jurusan_entity_1.Jurusan)
], LaporanBk.prototype, "jurusan", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => kelas_entity_1.Kelas, { eager: true, nullable: true }),
    __metadata("design:type", kelas_entity_1.Kelas)
], LaporanBk.prototype, "kelas", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { eager: true, nullable: true }),
    __metadata("design:type", user_entity_1.User)
], LaporanBk.prototype, "guruBkYangMenanganis", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], LaporanBk.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], LaporanBk.prototype, "updatedAt", void 0);
exports.LaporanBk = LaporanBk = __decorate([
    (0, typeorm_1.Entity)('laporan_bk')
], LaporanBk);
//# sourceMappingURL=laporan-bk.entity.js.map