"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BkScheduleModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const bk_schedule_service_1 = require("./bk-schedule.service");
const bk_schedule_controller_1 = require("./bk-schedule.controller");
const bk_schedule_entity_1 = require("./entities/bk-schedule.entity");
const reservasi_entity_1 = require("../reservasi/entities/reservasi.entity");
const user_entity_1 = require("../users/entities/user.entity");
let BkScheduleModule = class BkScheduleModule {
};
exports.BkScheduleModule = BkScheduleModule;
exports.BkScheduleModule = BkScheduleModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([bk_schedule_entity_1.BkSchedule, reservasi_entity_1.Reservasi, user_entity_1.User])],
        providers: [bk_schedule_service_1.BkScheduleService],
        controllers: [bk_schedule_controller_1.BkScheduleController],
        exports: [bk_schedule_service_1.BkScheduleService],
    })
], BkScheduleModule);
//# sourceMappingURL=bk-schedule.module.js.map