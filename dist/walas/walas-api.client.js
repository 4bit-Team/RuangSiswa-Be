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
    async getStudents(filters) {
        try {
            const params = new URLSearchParams();
            if (filters?.class_id)
                params.append('class_id', filters.class_id.toString());
            if (filters?.year_ajaran)
                params.append('year_ajaran', filters.year_ajaran);
            if (filters?.status)
                params.append('status', filters.status);
            if (filters?.page)
                params.append('page', filters.page.toString());
            if (filters?.limit)
                params.append('limit', filters.limit.toString());
            const url = this.buildUrl(`/api/v1/walas/students?${params.toString()}`);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, { headers: this.getHeaders() }));
            return response.data;
        }
        catch (error) {
            this.handleError(error, 'getStudents');
        }
    }
    async getStudentDetail(studentId) {
        try {
            const url = this.buildUrl(`/api/v1/walas/students/${studentId}`);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, { headers: this.getHeaders() }));
            return response.data.data;
        }
        catch (error) {
            this.handleError(error, 'getStudentDetail');
        }
    }
    async getClassStudents(classId) {
        try {
            const url = this.buildUrl(`/api/v1/walas/students/by-class/${classId}`);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, { headers: this.getHeaders() }));
            return response.data.data;
        }
        catch (error) {
            this.handleError(error, 'getClassStudents');
        }
    }
    async searchStudents(query, limit = 10) {
        try {
            const url = this.buildUrl(`/api/v1/walas/students/search?query=${encodeURIComponent(query)}&limit=${limit}`);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, { headers: this.getHeaders() }));
            return response.data.data;
        }
        catch (error) {
            this.handleError(error, 'searchStudents');
        }
    }
    async getAttendanceRecords(filters) {
        try {
            const params = new URLSearchParams();
            if (filters?.student_id)
                params.append('student_id', filters.student_id.toString());
            if (filters?.class_id)
                params.append('class_id', filters.class_id.toString());
            if (filters?.start_date)
                params.append('start_date', filters.start_date);
            if (filters?.end_date)
                params.append('end_date', filters.end_date);
            if (filters?.page)
                params.append('page', filters.page.toString());
            if (filters?.limit)
                params.append('limit', filters.limit.toString());
            const url = this.buildUrl(`/api/v1/walas/attendance?${params.toString()}`);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, { headers: this.getHeaders() }));
            return response.data;
        }
        catch (error) {
            this.handleError(error, 'getAttendanceRecords');
        }
    }
    async getAttendanceByMonth(studentId, month) {
        try {
            const url = this.buildUrl(`/api/v1/walas/attendance/${studentId}/month/${month}`);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, { headers: this.getHeaders() }));
            return response.data.data;
        }
        catch (error) {
            this.handleError(error, 'getAttendanceByMonth');
        }
    }
    async getAttendanceStats(studentId, yearMonth) {
        try {
            const query = yearMonth ? `?year_month=${yearMonth}` : '';
            const url = this.buildUrl(`/api/v1/walas/attendance/${studentId}/stats${query}`);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, { headers: this.getHeaders() }));
            return response.data.data;
        }
        catch (error) {
            this.handleError(error, 'getAttendanceStats');
        }
    }
    async getFlaggedStudents(threshold = 5, month) {
        try {
            const params = new URLSearchParams();
            params.append('threshold', threshold.toString());
            if (month)
                params.append('month', month);
            const url = this.buildUrl(`/api/v1/walas/attendance/flagged?${params.toString()}`);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, { headers: this.getHeaders() }));
            return response.data.data;
        }
        catch (error) {
            this.handleError(error, 'getFlaggedStudents');
        }
    }
    async getClassAttendanceByDate(classId, date) {
        try {
            const url = this.buildUrl(`/api/v1/walas/attendance/class/${classId}/date/${date}`);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, { headers: this.getHeaders() }));
            return response.data.data;
        }
        catch (error) {
            this.handleError(error, 'getClassAttendanceByDate');
        }
    }
    async getAllCaseNotes(filters) {
        try {
            const params = new URLSearchParams();
            if (filters?.start_date)
                params.append('start_date', filters.start_date);
            if (filters?.end_date)
                params.append('end_date', filters.end_date);
            if (filters?.walas_id)
                params.append('walas_id', filters.walas_id.toString());
            if (filters?.limit)
                params.append('limit', (filters.limit || 100).toString());
            if (filters?.page)
                params.append('page', (filters.page || 1).toString());
            const url = this.buildUrl(`/api/v1/walas/case-notes${params.toString() ? '?' + params.toString() : ''}`);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, { headers: this.getHeaders() }));
            return response.data;
        }
        catch (error) {
            this.handleError(error, 'getAllCaseNotes');
        }
    }
    async getCaseNotes(studentId, filters) {
        try {
            const query = new URLSearchParams();
            if (filters?.limit)
                query.append('limit', filters.limit.toString());
            if (filters?.page)
                query.append('page', filters.page.toString());
            const url = this.buildUrl(`/api/v1/walas/case-notes/byStudent/${studentId}${query.toString() ? '?' + query.toString() : ''}`);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, { headers: this.getHeaders() }));
            return response.data;
        }
        catch (error) {
            this.handleError(error, 'getCaseNotes');
        }
    }
    async getCaseNotesByWalas(walasId, filters) {
        try {
            const query = new URLSearchParams();
            if (filters?.limit)
                query.append('limit', filters.limit.toString());
            if (filters?.page)
                query.append('page', filters.page.toString());
            const url = this.buildUrl(`/api/v1/walas/case-notes/byWalas/${walasId}${query.toString() ? '?' + query.toString() : ''}`);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, { headers: this.getHeaders() }));
            return response.data;
        }
        catch (error) {
            this.handleError(error, 'getCaseNotesByWalas');
        }
    }
    async getRecentCaseNotes(studentId, limit = 5) {
        try {
            const url = this.buildUrl(`/api/v1/walas/case-notes/${studentId}/recent?limit=${limit}`);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, { headers: this.getHeaders() }));
            return response.data.data;
        }
        catch (error) {
            this.handleError(error, 'getRecentCaseNotes');
        }
    }
    async getHomeVisits(filters = {}) {
        try {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    params.append(key, String(value));
                }
            });
            const url = this.buildUrl(`/api/v1/walas/home-visits?${params.toString()}`);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, { headers: this.getHeaders() }));
            return response.data;
        }
        catch (error) {
            this.handleError(error, 'getHomeVisits');
        }
    }
    async getHomeVisitDetail(id) {
        try {
            const url = this.buildUrl(`/api/v1/walas/home-visits/${id}`);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, { headers: this.getHeaders() }));
            return response.data.data;
        }
        catch (error) {
            this.handleError(error, 'getHomeVisitDetail');
        }
    }
    async getHomeVisitsByStudent(studentId, limit = 50) {
        try {
            const url = this.buildUrl(`/api/v1/walas/home-visits/student/${studentId}?limit=${limit}`);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, { headers: this.getHeaders() }));
            return response.data.data;
        }
        catch (error) {
            this.handleError(error, 'getHomeVisitsByStudent');
        }
    }
    async getHomeVisitsByWalas(walasId, page = 1, per_page = 20) {
        try {
            const url = this.buildUrl(`/api/v1/walas/home-visits/walas/${walasId}?page=${page}&per_page=${per_page}`);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, { headers: this.getHeaders() }));
            return response.data;
        }
        catch (error) {
            this.handleError(error, 'getHomeVisitsByWalas');
        }
    }
    async getHomeVisitStats(filters = {}) {
        try {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    params.append(key, String(value));
                }
            });
            const url = this.buildUrl(`/api/v1/walas/home-visits/stats?${params.toString()}`);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, { headers: this.getHeaders() }));
            return response.data.data;
        }
        catch (error) {
            this.handleError(error, 'getHomeVisitStats');
        }
    }
    async getAchievements(filters = {}) {
        try {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    params.append(key, String(value));
                }
            });
            const url = this.buildUrl(`/api/v1/walas/achievements?${params.toString()}`);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, { headers: this.getHeaders() }));
            return response.data;
        }
        catch (error) {
            this.handleError(error, 'getAchievements');
        }
    }
    async getAchievementDetail(id) {
        try {
            const url = this.buildUrl(`/api/v1/walas/achievements/${id}`);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, { headers: this.getHeaders() }));
            return response.data.data;
        }
        catch (error) {
            this.handleError(error, 'getAchievementDetail');
        }
    }
    async getAchievementsByStudent(studentId, filters = {}) {
        try {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    params.append(key, String(value));
                }
            });
            const url = this.buildUrl(`/api/v1/walas/achievements/student/${studentId}?${params.toString()}`);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, { headers: this.getHeaders() }));
            return response.data.data;
        }
        catch (error) {
            this.handleError(error, 'getAchievementsByStudent');
        }
    }
    async getAchievementsByType(type, filters = {}) {
        try {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    params.append(key, String(value));
                }
            });
            const url = this.buildUrl(`/api/v1/walas/achievements/type/${type}?${params.toString()}`);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, { headers: this.getHeaders() }));
            return response.data;
        }
        catch (error) {
            this.handleError(error, 'getAchievementsByType');
        }
    }
    async getAchievementsByWalas(walasId, filters = {}) {
        try {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    params.append(key, String(value));
                }
            });
            const url = this.buildUrl(`/api/v1/walas/achievements/walas/${walasId}?${params.toString()}`);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, { headers: this.getHeaders() }));
            return response.data;
        }
        catch (error) {
            this.handleError(error, 'getAchievementsByWalas');
        }
    }
    async getAchievementStats(filters = {}) {
        try {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    params.append(key, String(value));
                }
            });
            const url = this.buildUrl(`/api/v1/walas/achievements/stats?${params.toString()}`);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, { headers: this.getHeaders() }));
            return response.data.data;
        }
        catch (error) {
            this.handleError(error, 'getAchievementStats');
        }
    }
    async getAchievementTypeStats(classId) {
        try {
            const params = classId ? `?class_id=${classId}` : '';
            const url = this.buildUrl(`/api/v1/walas/achievements/type-stats${params}`);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, { headers: this.getHeaders() }));
            return response.data.data;
        }
        catch (error) {
            this.handleError(error, 'getAchievementTypeStats');
        }
    }
    async getWalasById(walasId) {
        try {
            const url = this.buildUrl(`/api/v1/walas/walas/${walasId}`);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, { headers: this.getHeaders() }));
            return response.data.data || response.data;
        }
        catch (error) {
            this.handleError(error, 'getWalasById');
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