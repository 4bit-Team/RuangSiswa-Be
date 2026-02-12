"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PembinaanModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const pembinaan_service_1 = require("./pembinaan.service");
const pembinaan_controller_1 = require("./pembinaan.controller");
const pembinaan_entity_1 = require("./entities/pembinaan.entity");
const point_pelanggaran_entity_1 = require("../point-pelanggaran/entities/point-pelanggaran.entity");
const notification_module_1 = require("../../notifications/notification.module");
const walas_module_1 = require("../../walas/walas.module");
const users_module_1 = require("../../users/users.module");
const kelas_module_1 = require("../../kelas/kelas.module");
const jurusan_module_1 = require("../../jurusan/jurusan.module");
let PembinaanModule = class PembinaanModule {
};
exports.PembinaanModule = PembinaanModule;
exports.PembinaanModule = PembinaanModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([pembinaan_entity_1.Pembinaan, point_pelanggaran_entity_1.PointPelanggaran]),
            notification_module_1.NotificationModule,
            walas_module_1.WalasModule,
            users_module_1.UsersModule,
            kelas_module_1.KelasModule,
            jurusan_module_1.JurusanModule,
        ],
        controllers: [pembinaan_controller_1.PembinaanController],
        providers: [pembinaan_service_1.PembinaanService],
        exports: [pembinaan_service_1.PembinaanService],
    })
], PembinaanModule);
//# sourceMappingURL=pembinaan.module.js.map