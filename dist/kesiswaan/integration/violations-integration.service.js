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
var ViolationsIntegrationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViolationsIntegrationService = void 0;
const common_1 = require("@nestjs/common");
const auto_referral_service_1 = require("../bimbingan/auto-referral.service");
let ViolationsIntegrationService = ViolationsIntegrationService_1 = class ViolationsIntegrationService {
    autoReferralService;
    logger = new common_1.Logger(ViolationsIntegrationService_1.name);
    constructor(autoReferralService) {
        this.autoReferralService = autoReferralService;
    }
    async onSP2Generated(studentId, studentName, violationCount, violationDetails, tahun) {
        try {
            this.logger.log(`SP2 generated for student ${studentId} (${studentName}) - triggering bimbingan referral`);
            await this.autoReferralService.handleViolationReferral(studentId, studentName, 'SP2', violationCount, violationDetails, tahun);
        }
        catch (error) {
            this.logger.error(`Failed to create referral after SP2: ${error.message}`);
        }
    }
    async onSP3Generated(studentId, studentName, violationCount, violationDetails, tahun) {
        try {
            this.logger.log(`SP3 generated for student ${studentId} (${studentName}) - URGENT bimbingan referral`);
            await this.autoReferralService.handleViolationReferral(studentId, studentName, 'SP3', violationCount, violationDetails, tahun);
        }
        catch (error) {
            this.logger.error(`Failed to create referral after SP3: ${error.message}`);
        }
    }
};
exports.ViolationsIntegrationService = ViolationsIntegrationService;
exports.ViolationsIntegrationService = ViolationsIntegrationService = ViolationsIntegrationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)((0, common_1.forwardRef)(() => auto_referral_service_1.AutoReferralService))),
    __metadata("design:paramtypes", [auto_referral_service_1.AutoReferralService])
], ViolationsIntegrationService);
//# sourceMappingURL=violations-integration.service.js.map