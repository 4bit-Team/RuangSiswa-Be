"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TardinessModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const tardiness_service_1 = require("./tardiness.service");
const tardiness_controller_1 = require("./tardiness.controller");
const tardiness_entity_1 = require("./entities/tardiness.entity");
let TardinessModule = class TardinessModule {
};
exports.TardinessModule = TardinessModule;
exports.TardinessModule = TardinessModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                tardiness_entity_1.TardinessRecord,
                tardiness_entity_1.TardinessAppeal,
                tardiness_entity_1.TardinessSummary,
                tardiness_entity_1.TardinessAlert,
                tardiness_entity_1.TardinessPattern,
            ]),
            axios_1.HttpModule,
            config_1.ConfigModule,
        ],
        providers: [tardiness_service_1.TardinessService],
        controllers: [tardiness_controller_1.TardinessController],
        exports: [tardiness_service_1.TardinessService],
    })
], TardinessModule);
//# sourceMappingURL=tardiness.module.js.map