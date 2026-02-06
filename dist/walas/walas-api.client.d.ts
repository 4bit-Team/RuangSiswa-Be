import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
export declare class WalasApiClient {
    private httpService;
    private configService;
    private walasUrl;
    private apiToken;
    constructor(httpService: HttpService, configService: ConfigService);
    private getHeaders;
    private buildUrl;
    private handleError;
    getStudents(filters?: {
        class_id?: number;
        year_ajaran?: string;
        status?: string;
        page?: number;
        limit?: number;
    }): Promise<any>;
    getStudentDetail(studentId: number): Promise<any>;
    getClassStudents(classId: number): Promise<any>;
    searchStudents(query: string, limit?: number): Promise<any>;
    getAttendanceRecords(filters?: {
        student_id?: number;
        class_id?: number;
        start_date?: string;
        end_date?: string;
        page?: number;
        limit?: number;
    }): Promise<any>;
    getAttendanceByMonth(studentId: number, month: string): Promise<any>;
    getAttendanceStats(studentId: number, yearMonth?: string): Promise<any>;
    getFlaggedStudents(threshold?: number, month?: string): Promise<any>;
    getClassAttendanceByDate(classId: number, date: string): Promise<any>;
    getCaseNotes(studentId: number, filters?: {
        limit?: number;
        page?: number;
    }): Promise<any>;
    getCaseNotesByWalas(walasId: number, filters?: {
        limit?: number;
        page?: number;
    }): Promise<any>;
    getRecentCaseNotes(studentId: number, limit?: number): Promise<any>;
    getHomeVisits(filters?: {
        page?: number;
        per_page?: number;
        student_id?: number;
        walas_id?: number;
        status?: string;
        class_id?: number;
        date_from?: string;
        date_to?: string;
    }): Promise<any>;
    getHomeVisitDetail(id: number): Promise<any>;
    getHomeVisitsByStudent(studentId: number, limit?: number): Promise<any>;
    getHomeVisitsByWalas(walasId: number, page?: number, per_page?: number): Promise<any>;
    getHomeVisitStats(filters?: {
        class_id?: number;
        date_from?: string;
        date_to?: string;
    }): Promise<any>;
    getAchievements(filters?: {
        page?: number;
        per_page?: number;
        student_id?: number;
        walas_id?: number;
        type?: string;
        category_id?: number;
        class_id?: number;
        date_from?: string;
        date_to?: string;
    }): Promise<any>;
    getAchievementDetail(id: number): Promise<any>;
    getAchievementsByStudent(studentId: number, filters?: {
        type?: string;
        limit?: number;
    }): Promise<any>;
    getAchievementsByType(type: string, filters?: {
        page?: number;
        per_page?: number;
        class_id?: number;
        date_from?: string;
        date_to?: string;
    }): Promise<any>;
    getAchievementsByWalas(walasId: number, filters?: {
        page?: number;
        per_page?: number;
        date_from?: string;
        date_to?: string;
    }): Promise<any>;
    getAchievementStats(filters?: {
        class_id?: number;
        date_from?: string;
        date_to?: string;
    }): Promise<any>;
    getAchievementTypeStats(classId?: number): Promise<any>;
    healthCheck(): Promise<boolean>;
}
