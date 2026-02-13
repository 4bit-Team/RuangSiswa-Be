"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KehadiranModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const kehadiran_service_1 = require("./kehadiran.service");
const kehadiran_controller_1 = require("./kehadiran.controller");
const kehadiran_entity_1 = require("./entities/kehadiran.entity");
let KehadiranModule = class KehadiranModule {
};
exports.KehadiranModule = KehadiranModule;
exports.KehadiranModule = KehadiranModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([kehadiran_entity_1.Kehadiran])],
        controllers: [kehadiran_controller_1.KehadiranController],
        providers: [kehadiran_service_1.KehadiranService],
        exports: [kehadiran_service_1.KehadiranService],
    })
], KehadiranModule);
//# sourceMappingURL=kehadiran.module.js.map