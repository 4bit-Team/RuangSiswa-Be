"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallController = void 0;
const common_1 = require("@nestjs/common");
const call_service_1 = require("./call.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const call_dto_1 = require("./dto/call.dto");
let CallController = class CallController {
    callService;
    constructor(callService) {
        this.callService = callService;
    }
    async initiateCall(req, dto) {
        const call = await this.callService.initiateCall(req.user.id, dto);
        return {
            status: 'success',
            call,
        };
    }
    async getCall(callId) {
        const call = await this.callService.getCall(callId);
        return {
            status: 'success',
            call,
        };
    }
    async getCallHistory(req, otherUserId, limit = 50) {
        const calls = await this.callService.getCallHistory(req.user.id, otherUserId, limit);
        return {
            status: 'success',
            calls,
            total: calls.length,
        };
    }
    async getMissedCalls(req) {
        const missedCalls = await this.callService.getMissedCalls(req.user.id);
        return {
            status: 'success',
            missedCalls,
            count: missedCalls.length,
        };
    }
    async getCallStats(req) {
        const stats = await this.callService.getCallStats(req.user.id);
        return {
            status: 'success',
            stats,
        };
    }
    async markAsMissed(callId) {
        const call = await this.callService.markAsMissed(callId);
        return {
            status: 'success',
            call,
        };
    }
    async cleanupStaleRingingCalls() {
        await this.callService.cleanupStaleRingingCalls();
        return {
            status: 'success',
            message: 'Stale ringing calls cleaned up',
        };
    }
};
exports.CallController = CallController;
__decorate([
    (0, common_1.Post)('initiate'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, call_dto_1.CreateCallDto]),
    __metadata("design:returntype", Promise)
], CallController.prototype, "initiateCall", null);
__decorate([
    (0, common_1.Get)(':callId'),
    __param(0, (0, common_1.Param)('callId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CallController.prototype, "getCall", null);
__decorate([
    (0, common_1.Get)('history/:otherUserId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('otherUserId')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], CallController.prototype, "getCallHistory", null);
__decorate([
    (0, common_1.Get)('missed/list'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CallController.prototype, "getMissedCalls", null);
__decorate([
    (0, common_1.Get)('stats/summary'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CallController.prototype, "getCallStats", null);
__decorate([
    (0, common_1.Post)(':callId/missed'),
    __param(0, (0, common_1.Param)('callId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CallController.prototype, "markAsMissed", null);
__decorate([
    (0, common_1.Post)('maintenance/cleanup'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CallController.prototype, "cleanupStaleRingingCalls", null);
exports.CallController = CallController = __decorate([
    (0, common_1.Controller)('calls'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [call_service_1.CallService])
], CallController);
//# sourceMappingURL=call.controller.js.map