import { AttendanceService } from './attendance.service';
export declare class AttendanceController {
    private attendanceService;
    private readonly logger;
    constructor(attendanceService: AttendanceService);
    index(studentId?: number, classId?: number, startDate?: string, endDate?: string, page?: number, limit?: number): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/attendance-record.entity").AttendanceRecord[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
        pagination?: undefined;
    }>;
    summary(studentId: number, month: string): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/attendance-summary.entity").AttendanceSummary;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    history(studentId: number): Promise<{
        success: boolean;
        message: string;
        data: any[];
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    sync(body: {
        start_date: string;
        end_date: string;
        force_sync?: boolean;
    }): Promise<{
        success: boolean;
        message: string;
        data: import("./attendance.service").SyncResult;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    exportPdf(studentId: number, month: string): Promise<{
        success: boolean;
        message: string;
        data: string;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    exportExcel(classId: number, month: string): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
    }>;
    getAlerts(studentId?: number, severity?: string, resolved?: boolean): Promise<{
        success: boolean;
        message: string;
        data: never[];
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    resolveAlert(alertId: number, body: {
        notes: string;
    }): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
    }>;
}
