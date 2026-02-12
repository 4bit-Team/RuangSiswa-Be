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
var DiagnosticsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiagnosticsController = void 0;
const common_1 = require("@nestjs/common");
let DiagnosticsController = DiagnosticsController_1 = class DiagnosticsController {
    logger = new common_1.Logger(DiagnosticsController_1.name);
    async getRoutes() {
        this.logger.log('📊 Diagnostic - Routes information requested');
        return {
            message: '✅ API is working',
            timestamp: new Date().toISOString(),
            currentTime: new Date(),
            availableEndpoints: {
                pembinaan: {
                    path: '/api/v1/pembinaan',
                    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
                    description: 'Pembinaan management endpoints',
                },
                pembinaan_stats: {
                    path: '/api/v1/pembinaan/stats',
                    methods: ['GET'],
                    description: 'Get pembinaan statistics',
                },
                pembinaan_sync: {
                    path: '/api/v1/pembinaan/sync',
                    methods: ['POST'],
                    description: 'Sync pembinaan from WALASU',
                },
            },
        };
    }
    async getHealth() {
        this.logger.log('❤️ Health check requested');
        return {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            port: process.env.PORT || 3001,
            database: {
                host: process.env.DB_HOST || 'unknown',
                port: process.env.DB_PORT || 5432,
                database: process.env.DB_NAME || 'unknown',
            },
        };
    }
    async getPembinaanStatus() {
        this.logger.log('🔍 Pembinaan module status check');
        return {
            module: 'PembinaanModule',
            status: 'loaded',
            controller: 'PembinaanController',
            service: 'PembinaanService',
            baseRoute: '/api/v1/pembinaan',
            methods: {
                findAll: {
                    method: 'GET',
                    path: '/api/v1/pembinaan',
                    description: 'Get all pembinaan records',
                },
                findById: {
                    method: 'GET',
                    path: '/api/v1/pembinaan/:id',
                    description: 'Get single pembinaan record',
                },
                sync: {
                    method: 'POST',
                    path: '/api/v1/pembinaan/sync',
                    description: 'Sync from WALASU',
                },
            },
        };
    }
};
exports.DiagnosticsController = DiagnosticsController;
__decorate([
    (0, common_1.Get)('routes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DiagnosticsController.prototype, "getRoutes", null);
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DiagnosticsController.prototype, "getHealth", null);
__decorate([
    (0, common_1.Get)('pembinaan-status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DiagnosticsController.prototype, "getPembinaanStatus", null);
exports.DiagnosticsController = DiagnosticsController = DiagnosticsController_1 = __decorate([
    (0, common_1.Controller)('diagnostics')
], DiagnosticsController);
//# sourceMappingURL=diagnostics.controller.js.map