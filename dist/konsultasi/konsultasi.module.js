"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KonsultasiModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const konsultasi_controller_1 = require("./konsultasi.controller");
const konsultasi_service_1 = require("./konsultasi.service");
const konsultasi_entity_1 = require("./entities/konsultasi.entity");
const konsultasi_answer_entity_1 = require("./entities/konsultasi-answer.entity");
const konsultasi_bookmark_entity_1 = require("./entities/konsultasi-bookmark.entity");
const consultation_category_entity_1 = require("../consultation-category/entities/consultation-category.entity");
const toxic_filter_module_1 = require("../toxic-filter/toxic-filter.module");
let KonsultasiModule = class KonsultasiModule {
};
exports.KonsultasiModule = KonsultasiModule;
exports.KonsultasiModule = KonsultasiModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([konsultasi_entity_1.Konsultasi, konsultasi_answer_entity_1.KonsultasiAnswer, konsultasi_bookmark_entity_1.KonsultasiBookmark, consultation_category_entity_1.ConsultationCategory]),
            toxic_filter_module_1.ToxicFilterModule,
        ],
        controllers: [konsultasi_controller_1.KonsultasiController],
        providers: [konsultasi_service_1.KonsultasiService],
        exports: [konsultasi_service_1.KonsultasiService],
    })
], KonsultasiModule);
//# sourceMappingURL=konsultasi.module.js.map