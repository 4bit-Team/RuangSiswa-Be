import { Repository } from 'typeorm';
import { WalasApiClient } from '../../walas/walas-api.client';
import { TardinessRecord, TardinessAppeal, TardinessSummary, TardinessAlert, TardinessPattern } from './entities/tardiness.entity';
interface SubmitTardinessDto {
    student_id: number;
    student_name: string;
    class_id: number;
    tanggal: string;
    keterlambatan_menit: number;
    alasan?: string;
    bukti_foto?: string;
    created_by: string;
}
interface AppealTardinessDto {
    tardiness_record_id: string;
    alasan_appeal: string;
    bukti_appeal?: string;
}
interface ReviewAppealDto {
    appeal_id: string;
    status: 'accepted' | 'rejected';
    catatan_bk?: string;
    resolved_by: string;
}
export interface SyncResult {
    submitted: number;
    verified: number;
    failed: number;
    errors: string[];
}
export declare class TardinessService {
    private recordRepo;
    private appealRepo;
    private summaryRepo;
    private alertRepo;
    private patternRepo;
    private walasApiClient;
    private readonly logger;
    constructor(recordRepo: Repository<TardinessRecord>, appealRepo: Repository<TardinessAppeal>, summaryRepo: Repository<TardinessSummary>, alertRepo: Repository<TardinessAlert>, patternRepo: Repository<TardinessPattern>, walasApiClient: WalasApiClient);
    submitTardiness(dto: SubmitTardinessDto): Promise<TardinessRecord>;
    syncTardinessFromWalas(startDate: Date, endDate: Date, forceSync?: boolean): Promise<{
        success: boolean;
        synced_records: number;
        failed: number;
        errors: any[];
    }>;
    getTardinessRecords(filters: {
        student_id?: number;
        class_id?: number;
        status?: string;
        date_from?: string;
        date_to?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: TardinessRecord[];
        total: number;
        page: number;
        limit: number;
    }>;
    getTardinessSummary(student_id: number, tahun_bulan?: string): Promise<TardinessSummary | Partial<TardinessSummary> | null>;
    getTardinessHistory(student_id: number, months?: number): Promise<(TardinessSummary | Partial<TardinessSummary>)[]>;
    appealTardiness(dto: AppealTardinessDto): Promise<TardinessAppeal>;
    getStudentAppeals(student_id: number, filters?: {
        status?: string;
        is_resolved?: boolean;
    }): Promise<TardinessAppeal[]>;
    reviewAppeal(dto: ReviewAppealDto): Promise<TardinessAppeal | null>;
    generateTardinessAlerts(): Promise<SyncResult>;
    getUnresolvedAlerts(filters?: {
        student_id?: number;
        severity?: string;
    }): Promise<TardinessAlert[]>;
    resolveAlert(alert_id: string, resolved_by: string): Promise<TardinessAlert | null>;
    detectPatterns(student_id: number): Promise<TardinessPattern[]>;
    exportReport(student_id: number, month: string): Promise<any>;
    private getCurrentYearMonth;
    private updateMonthlySummary;
    private calculateSummary;
    private isTardy;
    private calculateMinutesLate;
    private formatDate;
}
export {};
