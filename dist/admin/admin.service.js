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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const call_gateway_1 = require("../chat/call.gateway");
let AdminService = class AdminService {
    callGateway;
    constructor(callGateway) {
        this.callGateway = callGateway;
    }
    async getBlockedUsers() {
        return this.callGateway.getBlockedUsers();
    }
    async getSuspiciousUsers() {
        return this.callGateway.getSuspiciousUsers();
    }
    async unblockUser(userId) {
        const userIdNum = typeof userId === 'string' ? parseInt(userId, 10) : userId;
        console.log(`[ADMIN_SERVICE] 🔓 Unblocking user ${userIdNum}... (Input: "${userId}" type: ${typeof userId})`);
        const result = this.callGateway.unblockUserAdmin(userIdNum);
        console.log(`[ADMIN_SERVICE] Result for user ${userIdNum}: ${result}`);
        console.log(`[ADMIN_SERVICE] 📊 Remaining blocked: ${this.callGateway.getBlockedUsers().length}, Suspicious: ${this.callGateway.getSuspiciousUsers().length}`);
        return result;
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [call_gateway_1.CallGateway])
], AdminService);
//# sourceMappingURL=admin.service.js.map