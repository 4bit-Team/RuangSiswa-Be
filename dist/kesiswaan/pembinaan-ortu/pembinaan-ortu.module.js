"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PembinaanOrtuModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const pembinaan_ortu_service_1 = require("./pembinaan-ortu.service");
const pembinaan_ortu_controller_1 = require("./pembinaan-ortu.controller");
const pembinaan_ortu_entity_1 = require("./entities/pembinaan-ortu.entity");
const pembinaan_entity_1 = require("../pembinaan/entities/pembinaan.entity");
let PembinaanOrtuModule = class PembinaanOrtuModule {
};
exports.PembinaanOrtuModule = PembinaanOrtuModule;
exports.PembinaanOrtuModule = PembinaanOrtuModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([pembinaan_ortu_entity_1.PembinaanOrtu, pembinaan_entity_1.Pembinaan])],
        providers: [pembinaan_ortu_service_1.PembinaanOrtuService],
        controllers: [pembinaan_ortu_controller_1.PembinaanOrtuController],
        exports: [pembinaan_ortu_service_1.PembinaanOrtuService],
    })
], PembinaanOrtuModule);
//# sourceMappingURL=pembinaan-ortu.module.js.map