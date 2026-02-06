"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BimbinganModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const bimbingan_service_1 = require("./bimbingan.service");
const bimbingan_controller_1 = require("./bimbingan.controller");
const auto_referral_service_1 = require("./auto-referral.service");
const bimbingan_entity_1 = require("./entities/bimbingan.entity");
let BimbinganModule = class BimbinganModule {
};
exports.BimbinganModule = BimbinganModule;
exports.BimbinganModule = BimbinganModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                bimbingan_entity_1.BimbinganCategory,
                bimbingan_entity_1.BimbinganReferral,
                bimbingan_entity_1.BimbinganSesi,
                bimbingan_entity_1.BimbinganCatat,
                bimbingan_entity_1.BimbinganIntervensi,
                bimbingan_entity_1.BimbinganPerkembangan,
                bimbingan_entity_1.BimbinganAbility,
                bimbingan_entity_1.BimbinganTarget,
                bimbingan_entity_1.BimbinganStatus,
                bimbingan_entity_1.BimbinganStatistik,
            ]),
        ],
        controllers: [bimbingan_controller_1.BimbinganController],
        providers: [bimbingan_service_1.BimbinganService, auto_referral_service_1.AutoReferralService],
        exports: [bimbingan_service_1.BimbinganService, auto_referral_service_1.AutoReferralService],
    })
], BimbinganModule);
//# sourceMappingURL=bimbingan.module.js.map