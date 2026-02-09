import { Repository } from 'typeorm';
import { WalasApiClient } from '../../walas/walas-api.client';
import { AttendanceRecord } from './entities/attendance-record.entity';
import { AttendanceSummary } from './entities/attendance-summary.entity';
import { AttendanceAlert } from './entities/attendance-alert.entity';
export declare class AttendanceService {
    private attendanceRecordRepo;
    private attendanceSummaryRepo;
    private attendanceAlertRepo;
    private walasApiClient;
    private readonly logger;
    constructor(attendanceRecordRepo: Repository<AttendanceRecord>, attendanceSummaryRepo: Repository<AttendanceSummary>, attendanceAlertRepo: Repository<AttendanceAlert>, walasApiClient: WalasApiClient);
    syncAttendanceFromWalas(startDate: Date, endDate: Date, forceSync?: boolean): Promise<SyncResult>;
    getAttendanceRecords(filters: {
        student_id?: number;
        class_id?: number;
        start_date?: Date;
        end_date?: Date;
        page?: number;
        limit?: number;
    }): Promise<{
        data: AttendanceRecord[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getAttendanceSummary(studentId: number, month: string): Promise<AttendanceSummary>;
    generateAttendanceAlerts(): Promise<void>;
    exportAttendance(studentId: number, month: string, format: 'pdf' | 'excel'): Promise<Buffer>;
    private formatDate;
    private getAllStudents;
    private generatePdfReport;
    private generateExcelReport;
}
export interface SyncResult {
    success: boolean;
    synced_records: number;
    failed: number;
    errors: any[];
}
