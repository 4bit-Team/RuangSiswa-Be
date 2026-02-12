"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KelasModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const kelas_entity_1 = require("./entities/kelas.entity");
const kelas_service_1 = require("./kelas.service");
const kelas_controller_1 = require("./kelas.controller");
let KelasModule = class KelasModule {
};
exports.KelasModule = KelasModule;
exports.KelasModule = KelasModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([kelas_entity_1.Kelas])],
        controllers: [kelas_controller_1.KelasController],
        providers: [kelas_service_1.KelasService],
        exports: [kelas_service_1.KelasService],
    })
], KelasModule);
//# sourceMappingURL=kelas.module.js.map