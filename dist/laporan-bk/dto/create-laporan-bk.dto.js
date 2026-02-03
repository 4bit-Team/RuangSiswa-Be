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
exports.CreateLaporanBkDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateLaporanBkDto {
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
}
exports.CreateLaporanBkDto = CreateLaporanBkDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLaporanBkDto.prototype, "namaKonseling", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateLaporanBkDto.prototype, "jurusanId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateLaporanBkDto.prototype, "kelasId", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], CreateLaporanBkDto.prototype, "tanggalDiprosesAiBk", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLaporanBkDto.prototype, "deskripsiKasusMasalah", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLaporanBkDto.prototype, "bentukPenanganganSebelumnya", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLaporanBkDto.prototype, "riwayatSpDanKasus", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLaporanBkDto.prototype, "layananBk", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLaporanBkDto.prototype, "followUpTindakanBk", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLaporanBkDto.prototype, "penahanganGuruBkKonselingProsesPembinaan", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLaporanBkDto.prototype, "pertemuanKe1", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLaporanBkDto.prototype, "pertemuanKe2", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLaporanBkDto.prototype, "pertemuanKe3", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLaporanBkDto.prototype, "hasilPemantauanKeterangan", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateLaporanBkDto.prototype, "guruBkYangMenanganiId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['Membaik', 'Stabil', 'Menurun', 'Belum Terlihat Perubahan']),
    __metadata("design:type", String)
], CreateLaporanBkDto.prototype, "statusPerkembanganPesertaDidik", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLaporanBkDto.prototype, "keteranganKetersedianDokumen", void 0);
//# sourceMappingURL=create-laporan-bk.dto.js.map