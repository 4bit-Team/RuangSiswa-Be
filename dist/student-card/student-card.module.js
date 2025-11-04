"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentCardModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const student_card_service_1 = require("./student-card.service");
const student_card_controller_1 = require("./student-card.controller");
const student_card_entity_1 = require("./entities/student-card.entity");
const users_module_1 = require("../users/users.module");
const student_card_validation_service_1 = require("../student-card-validation/student-card-validation.service");
let StudentCardModule = class StudentCardModule {
};
exports.StudentCardModule = StudentCardModule;
exports.StudentCardModule = StudentCardModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([student_card_entity_1.StudentCard]),
            users_module_1.UsersModule,
        ],
        controllers: [student_card_controller_1.StudentCardController],
        providers: [student_card_service_1.StudentCardService, student_card_validation_service_1.StudentCardValidationService],
        exports: [student_card_service_1.StudentCardService],
    })
], StudentCardModule);
//# sourceMappingURL=student-card.module.js.map