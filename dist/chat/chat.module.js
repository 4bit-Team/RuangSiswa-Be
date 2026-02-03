"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_1 = require("@nestjs/jwt");
const chat_service_1 = require("./chat.service");
const chat_controller_1 = require("./chat.controller");
const chat_gateway_1 = require("./chat.gateway");
const call_gateway_1 = require("./call.gateway");
const call_service_1 = require("./call.service");
const call_controller_1 = require("./call.controller");
const conversation_entity_1 = require("./entities/conversation.entity");
const message_entity_1 = require("./entities/message.entity");
const message_read_status_entity_1 = require("./entities/message-read-status.entity");
const call_entity_1 = require("./entities/call.entity");
const toxic_filter_module_1 = require("../toxic-filter/toxic-filter.module");
let ChatModule = class ChatModule {
};
exports.ChatModule = ChatModule;
exports.ChatModule = ChatModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([conversation_entity_1.Conversation, message_entity_1.Message, message_read_status_entity_1.MessageReadStatus, call_entity_1.Call]),
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || 'your-secret-key',
                signOptions: { expiresIn: '24h' },
            }),
            toxic_filter_module_1.ToxicFilterModule,
        ],
        providers: [chat_service_1.ChatService, call_service_1.CallService, chat_gateway_1.ChatGateway, call_gateway_1.CallGateway],
        controllers: [chat_controller_1.ChatController, call_controller_1.CallController],
        exports: [chat_service_1.ChatService, call_service_1.CallService],
    })
], ChatModule);
//# sourceMappingURL=chat.module.js.map