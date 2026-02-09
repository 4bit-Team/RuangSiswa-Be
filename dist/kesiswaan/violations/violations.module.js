"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViolationsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const violations_service_1 = require("./violations.service");
const violations_controller_1 = require("./violations.controller");
const sp_pdf_service_1 = require("./sp-pdf.service");
const walas_module_1 = require("../../walas/walas.module");
const violation_entity_1 = require("./entities/violation.entity");
let ViolationsModule = class ViolationsModule {
};
exports.ViolationsModule = ViolationsModule;
exports.ViolationsModule = ViolationsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                violation_entity_1.Violation,
                violation_entity_1.ViolationCategory,
                violation_entity_1.SpLetter,
                violation_entity_1.SpProgression,
                violation_entity_1.ViolationExcuse,
                violation_entity_1.ViolationStatistics,
            ]),
            walas_module_1.WalasModule,
        ],
        controllers: [violations_controller_1.ViolationsController],
        providers: [violations_service_1.ViolationService, sp_pdf_service_1.SpPdfService],
        exports: [violations_service_1.ViolationService, sp_pdf_service_1.SpPdfService],
    })
], ViolationsModule);
//# sourceMappingURL=violations.module.js.map