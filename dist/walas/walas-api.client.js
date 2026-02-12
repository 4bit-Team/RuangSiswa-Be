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
    async getStudentBiodata(studentId) {
        try {
            let url = this.buildUrl(`/api/v1/walas/students/${studentId}`);
            let response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, { headers: this.getHeaders(), validateStatus: () => true }));
            if (response.status === 404) {
                console.warn(`API v1 students endpoint not found, trying fallback /get-siswa endpoint`);
                url = this.buildUrl(`/get-siswa/${studentId}`);
                response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, { headers: this.getHeaders() }));
            }
            return response.data?.data || response.data;
        }
        catch (error) {
            console.warn(`Could not fetch student biodata for ${studentId}: ${error.message}`);
            return null;
        }
    }
    async getStudentParentData(studentId) {
        try {
            let student = await this.getStudentBiodata(studentId);
            if (student?.biodata) {
                console.log(`✅ Found biodata from student endpoint for student ${studentId}`);
                return student.biodata;
            }
            if (student?.nama_ayah || student?.nama_ibu) {
                console.log(`✅ Found parent data directly in student for student ${studentId}`);
                return student;
            }
            console.warn(`Biodata not found in student endpoint, trying pelanggaran list...`);
            const pelanggaranList = await this.getPelanggaranByStudent(studentId, 1);
            if (Array.isArray(pelanggaranList) && pelanggaranList.length > 0) {
                const pelanggaran = pelanggaranList[0];
                if (pelanggaran?.parent_data) {
                    console.log(`✅ Found parent_data in pelanggaran for student ${studentId}`);
                    return pelanggaran.parent_data;
                }
                if (pelanggaran?.siswa?.biodata) {
                    console.log(`✅ Found biodata in pelanggaran.siswa for student ${studentId}`);
                    return pelanggaran.siswa.biodata;
                }
            }
            console.warn(`No parent data found for student ${studentId}`);
            return null;
        }
        catch (error) {
            console.warn(`Error fetching parent data for student ${studentId}: ${error.message}`);
            return null;
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