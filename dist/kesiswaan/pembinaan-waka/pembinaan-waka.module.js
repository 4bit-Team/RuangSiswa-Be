"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PembinaanWakaModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const pembinaan_waka_service_1 = require("./pembinaan-waka.service");
const pembinaan_waka_controller_1 = require("./pembinaan-waka.controller");
const pembinaan_waka_entity_1 = require("./entities/pembinaan-waka.entity");
const reservasi_entity_1 = require("../../reservasi/entities/reservasi.entity");
const notification_module_1 = require("../../notifications/notification.module");
let PembinaanWakaModule = class PembinaanWakaModule {
};
exports.PembinaanWakaModule = PembinaanWakaModule;
exports.PembinaanWakaModule = PembinaanWakaModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([pembinaan_waka_entity_1.PembinaanWaka, reservasi_entity_1.Reservasi]), notification_module_1.NotificationModule],
        controllers: [pembinaan_waka_controller_1.PembinaanWakaController],
        providers: [pembinaan_waka_service_1.PembinaanWakaService],
        exports: [pembinaan_waka_service_1.PembinaanWakaService],
    })
], PembinaanWakaModule);
//# sourceMappingURL=pembinaan-waka.module.js.map