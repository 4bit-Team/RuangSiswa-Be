"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_1 = require("@nestjs/jwt");
const call_entity_1 = require("./entities/call.entity");
const call_service_1 = require("./call.service");
const call_gateway_1 = require("./call.gateway");
let CallModule = class CallModule {
};
exports.CallModule = CallModule;
exports.CallModule = CallModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([call_entity_1.Call])],
        providers: [call_service_1.CallService, call_gateway_1.CallGateway, jwt_1.JwtService],
        exports: [call_gateway_1.CallGateway],
    })
], CallModule);
//# sourceMappingURL=call.module.js.map