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
exports.SyncPembinaanDto = void 0;
const class_validator_1 = require("class-validator");
class SyncPembinaanDto {
    walas_id;
    walas_name;
    siswas_id;
    siswas_name;
    kasus;
    tindak_lanjut;
    keterangan;
    tanggal_pembinaan;
    point_pelanggaran_id;
    class_id;
    class_name;
}
exports.SyncPembinaanDto = SyncPembinaanDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], SyncPembinaanDto.prototype, "walas_id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Length)(1, 255),
    __metadata("design:type", String)
], SyncPembinaanDto.prototype, "walas_name", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], SyncPembinaanDto.prototype, "siswas_id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Length)(1, 255),
    __metadata("design:type", String)
], SyncPembinaanDto.prototype, "siswas_name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(3, 255),
    __metadata("design:type", String)
], SyncPembinaanDto.prototype, "kasus", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Length)(1, 255),
    __metadata("design:type", String)
], SyncPembinaanDto.prototype, "tindak_lanjut", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Length)(1, 2000),
    __metadata("design:type", String)
], SyncPembinaanDto.prototype, "keterangan", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SyncPembinaanDto.prototype, "tanggal_pembinaan", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], SyncPembinaanDto.prototype, "point_pelanggaran_id", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], SyncPembinaanDto.prototype, "class_id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Length)(1, 100),
    __metadata("design:type", String)
], SyncPembinaanDto.prototype, "class_name", void 0);
//# sourceMappingURL=sync-pembinaan.dto.js.map