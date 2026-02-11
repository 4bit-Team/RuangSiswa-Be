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
exports.WalasApiClient = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
let WalasApiClient = class WalasApiClient {
    httpService;
    configService;
    walasUrl;
    apiToken;
    constructor(httpService, configService) {
        this.httpService = httpService;
        this.configService = configService;
        this.walasUrl = this.configService.get('WALAS_API_URL', 'http://localhost:8000');
        this.apiToken = this.configService.get('WALAS_API_TOKEN', '');
    }
    getHeaders() {
        return {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
            'X-System': 'ruang-siswa-kesiswaan',
        };
    }
    buildUrl(endpoint) {
        return `${this.walasUrl}${endpoint}`;
    }
    handleError(error, method) {
        console.error(`${method} error:`, error.response?.data || error.message);
        throw new Error(`Failed to call Walas API: ${error.response?.statusText || error.message}`);
    }
    async getPelanggaranList(filters) {
        try {
            const params = new URLSearchParams();
            if (filters?.student_id)
                params.append('student_id', filters.student_id.toString());
            if (filters?.class_id)
                params.append('class_id', filters.class_id.toString());
            if (filters?.walas_id)
                params.append('walas_id', filters.walas_id.toString());
            if (filters?.start_date)
                params.append('start_date', filters.start_date);
            if (filters?.end_date)
                params.append('end_date', filters.end_date);
            if (filters?.page)
                params.append('page', (filters.page || 1).toString());
            if (filters?.limit)
                params.append('limit', (filters.limit || 50).toString());
            const url = this.buildUrl(`/api/v1/walas/pelanggaran${params.toString() ? '?' + params.toString() : ''}`);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, { headers: this.getHeaders() }));
            return response.data;
        }
        catch (error) {
            this.handleError(error, 'getPelanggaranList');
        }
    }
    async syncPembinaanFromWalas(payload) {
        try {
            const url = this.buildUrl('/api/v1/walas/pelanggaran/sync');
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(url, payload, { headers: this.getHeaders() }));
            return response.data;
        }
        catch (error) {
            this.handleError(error, 'syncPembinaanFromWalas');
        }
    }
    async getPelanggaranStats(filters) {
        try {
            const params = new URLSearchParams();
            if (filters?.class_id)
                params.append('class_id', filters.class_id.toString());
            if (filters?.walas_id)
                params.append('walas_id', filters.walas_id.toString());
            if (filters?.start_date)
                params.append('start_date', filters.start_date);
            if (filters?.end_date)
                params.append('end_date', filters.end_date);
            const url = this.buildUrl(`/api/v1/walas/pelanggaran/stats${params.toString() ? '?' + params.toString() : ''}`);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, { headers: this.getHeaders() }));
            return response.data.data;
        }
        catch (error) {
            this.handleError(error, 'getPelanggaranStats');
        }
    }
    async getPelanggaranDetail(pelanggaranId) {
        try {
            const url = this.buildUrl(`/api/v1/walas/pelanggaran/${pelanggaranId}`);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, { headers: this.getHeaders() }));
            return response.data.data || response.data;
        }
        catch (error) {
            this.handleError(error, 'getPelanggaranDetail');
        }
    }
    async getPelanggaranByStudent(studentId, limit = 50) {
        try {
            const url = this.buildUrl(`/api/v1/walas/pelanggaran/student/${studentId}?limit=${limit}`);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, { headers: this.getHeaders() }));
            return response.data.data || response.data;
        }
        catch (error) {
            this.handleError(error, 'getPelanggaranByStudent');
        }
    }
    async getPelanggaranByWalas(walasId, page = 1, limit = 50) {
        try {
            const url = this.buildUrl(`/api/v1/walas/pelanggaran/walas/${walasId}?page=${page}&limit=${limit}`);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, { headers: this.getHeaders() }));
            return response.data;
        }
        catch (error) {
            this.handleError(error, 'getPelanggaranByWalas');
        }
    }
    async healthCheck() {
        try {
            const url = this.buildUrl('/api/v1/walas/students');
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, {
                headers: this.getHeaders(),
                timeout: 5000,
            }));
            return response.status === 200;
        }
        catch (error) {
            console.error('Walas API health check failed:', error);
            return false;
        }
    }
};
exports.WalasApiClient = WalasApiClient;
exports.WalasApiClient = WalasApiClient = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], WalasApiClient);
//# sourceMappingURL=walas-api.client.js.map