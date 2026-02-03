"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CounselingCategoryModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const counseling_category_entity_1 = require("./entities/counseling-category.entity");
const counseling_category_service_1 = require("./counseling-category.service");
const counseling_category_controller_1 = require("./counseling-category.controller");
let CounselingCategoryModule = class CounselingCategoryModule {
};
exports.CounselingCategoryModule = CounselingCategoryModule;
exports.CounselingCategoryModule = CounselingCategoryModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([counseling_category_entity_1.CounselingCategory])],
        providers: [counseling_category_service_1.CounselingCategoryService],
        controllers: [counseling_category_controller_1.CounselingCategoryController],
        exports: [counseling_category_service_1.CounselingCategoryService],
    })
], CounselingCategoryModule);
//# sourceMappingURL=counseling-category.module.js.map