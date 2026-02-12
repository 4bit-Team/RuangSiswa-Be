"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PembinaanRinganModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const pembinaan_ringan_service_1 = require("./pembinaan-ringan.service");
const pembinaan_ringan_controller_1 = require("./pembinaan-ringan.controller");
const pembinaan_ringan_entity_1 = require("./entities/pembinaan-ringan.entity");
const reservasi_entity_1 = require("../../reservasi/entities/reservasi.entity");
let PembinaanRinganModule = class PembinaanRinganModule {
};
exports.PembinaanRinganModule = PembinaanRinganModule;
exports.PembinaanRinganModule = PembinaanRinganModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([pembinaan_ringan_entity_1.PembinaanRingan, reservasi_entity_1.Reservasi])],
        providers: [pembinaan_ringan_service_1.PembinaanRinganService],
        controllers: [pembinaan_ringan_controller_1.PembinaanRinganController],
        exports: [pembinaan_ringan_service_1.PembinaanRinganService],
    })
], PembinaanRinganModule);
//# sourceMappingURL=pembinaan-ringan.module.js.map