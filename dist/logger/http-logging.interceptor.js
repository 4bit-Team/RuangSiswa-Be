"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var HttpLoggingInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpLoggingInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
let HttpLoggingInterceptor = HttpLoggingInterceptor_1 = class HttpLoggingInterceptor {
    logger = new common_1.Logger(HttpLoggingInterceptor_1.name);
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const { method, url, query, params, body } = request;
        const startTime = Date.now();
        const requestId = Math.random().toString(36).substring(7);
        this.logger.log(`[${requestId}] 📨 ${method} ${url} - Query: ${JSON.stringify(query || {})} - Params: ${JSON.stringify(params || {})}`);
        if (body && Object.keys(body).length > 0) {
            this.logger.debug(`[${requestId}] 📦 Request Body: ${JSON.stringify(body)}`);
        }
        return next.handle().pipe((0, operators_1.tap)((data) => {
            const duration = Date.now() - startTime;
            this.logger.log(`[${requestId}] ✅ ${method} ${url} - ${duration}ms`);
        }), (0, operators_1.catchError)((error) => {
            const duration = Date.now() - startTime;
            this.logger.error(`[${requestId}] ❌ ${method} ${url} - ${duration}ms - Error: ${error.message}`, error.stack);
            throw error;
        }));
    }
};
exports.HttpLoggingInterceptor = HttpLoggingInterceptor;
exports.HttpLoggingInterceptor = HttpLoggingInterceptor = HttpLoggingInterceptor_1 = __decorate([
    (0, common_1.Injectable)()
], HttpLoggingInterceptor);
//# sourceMappingURL=http-logging.interceptor.js.map