"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BkJurusanModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const bk_jurusan_controller_1 = require("./bk-jurusan.controller");
const bk_jurusan_service_1 = require("./bk-jurusan.service");
const bk_jurusan_entity_1 = require("./entities/bk-jurusan.entity");
const user_entity_1 = require("../users/entities/user.entity");
let BkJurusanModule = class BkJurusanModule {
};
exports.BkJurusanModule = BkJurusanModule;
exports.BkJurusanModule = BkJurusanModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([bk_jurusan_entity_1.BkJurusan, user_entity_1.User])],
        controllers: [bk_jurusan_controller_1.BkJurusanController],
        providers: [bk_jurusan_service_1.BkJurusanService],
        exports: [bk_jurusan_service_1.BkJurusanService],
    })
], BkJurusanModule);
//# sourceMappingURL=bk-jurusan.module.js.map