"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JurusanModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const jurusan_entity_1 = require("./entities/jurusan.entity");
const jurusan_controller_1 = require("./jurusan.controller");
const jurusan_service_1 = require("./jurusan.service");
let JurusanModule = class JurusanModule {
};
exports.JurusanModule = JurusanModule;
exports.JurusanModule = JurusanModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([jurusan_entity_1.Jurusan])],
        controllers: [jurusan_controller_1.JurusanController],
        providers: [jurusan_service_1.JurusanService],
        exports: [jurusan_service_1.JurusanService],
    })
], JurusanModule);
//# sourceMappingURL=jurusan.module.js.map