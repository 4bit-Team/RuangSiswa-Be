"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservasiModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const reservasi_service_1 = require("./reservasi.service");
const reservasi_controller_1 = require("./reservasi.controller");
const reservasi_entity_1 = require("./entities/reservasi.entity");
const feedback_entity_1 = require("./entities/feedback.entity");
const counseling_category_entity_1 = require("../counseling-category/entities/counseling-category.entity");
const chat_module_1 = require("../chat/chat.module");
const users_module_1 = require("../users/users.module");
const feedback_service_1 = require("./feedback.service");
let ReservasiModule = class ReservasiModule {
};
exports.ReservasiModule = ReservasiModule;
exports.ReservasiModule = ReservasiModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([reservasi_entity_1.Reservasi, feedback_entity_1.Feedback, counseling_category_entity_1.CounselingCategory]),
            chat_module_1.ChatModule,
            users_module_1.UsersModule,
        ],
        providers: [reservasi_service_1.ReservasiService, feedback_service_1.FeedbackService],
        controllers: [reservasi_controller_1.ReservasiController],
        exports: [reservasi_service_1.ReservasiService, feedback_service_1.FeedbackService],
    })
], ReservasiModule);
//# sourceMappingURL=reservasi.module.js.map