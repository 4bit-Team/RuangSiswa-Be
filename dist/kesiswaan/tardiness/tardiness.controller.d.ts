import { TardinessService } from './tardiness.service';
export declare class TardinessController {
    private tardinessService;
    constructor(tardinessService: TardinessService);
    getTardinessRecords(student_id?: string, class_id?: string, status?: string, date_from?: string, date_to?: string, page?: string, limit?: string): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/tardiness.entity").TardinessRecord[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    submitTardiness(dto: {
        student_id: number;
        student_name: string;
        class_id: number;
        tanggal: string;
        keterlambatan_menit: number;
        alasan?: string;
        bukti_foto?: string;
        created_by: string;
    }): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/tardiness.entity").TardinessRecord;
    }>;
    getTardinessSummary(studentId: string, month?: string): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/tardiness.entity").TardinessSummary | Partial<import("./entities/tardiness.entity").TardinessSummary> | null;
    }>;
    getTardinessHistory(studentId: string, months?: string): Promise<{
        success: boolean;
        message: string;
        data: (import("./entities/tardiness.entity").TardinessSummary | Partial<import("./entities/tardiness.entity").TardinessSummary>)[];
    }>;
    getStudentAppeals(studentId: string, status?: string, is_resolved?: string): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/tardiness.entity").TardinessAppeal[];
    }>;
    appealTardiness(recordId: string, dto: {
        alasan_appeal: string;
        bukti_appeal?: string;
    }): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/tardiness.entity").TardinessAppeal;
    }>;
    reviewAppeal(appealId: string, dto: {
        status: 'accepted' | 'rejected';
        catatan_bk?: string;
        resolved_by: string;
    }): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/tardiness.entity").TardinessAppeal | null;
    }>;
    generateAlerts(): Promise<{
        success: boolean;
        message: string;
        data: import("./tardiness.service").SyncResult;
    }>;
    getAlerts(student_id?: string, severity?: string): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/tardiness.entity").TardinessAlert[];
    }>;
    resolveAlert(alertId: string, dto: {
        resolved_by: string;
    }): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/tardiness.entity").TardinessAlert | null;
    }>;
    detectPatterns(studentId: string): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/tardiness.entity").TardinessPattern[];
    }>;
    exportReport(studentId: string, month?: string): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
}
