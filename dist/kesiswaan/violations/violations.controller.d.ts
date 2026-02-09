import type { Response } from 'express';
import { ViolationService } from './violations.service';
import { SpPdfService } from './sp-pdf.service';
import { Repository } from 'typeorm';
import { SpLetter } from './entities/violation.entity';
export declare class ViolationsController {
    private readonly violationService;
    private readonly spPdfService;
    private spLetterRepo;
    private readonly logger;
    constructor(violationService: ViolationService, spPdfService: SpPdfService, spLetterRepo: Repository<SpLetter>);
    reportViolation(dto: any, user: any): Promise<{
        success: boolean;
        message: string;
        data: {
            violation: import("./entities/violation.entity").Violation;
            riskLevel: {
                risk_level: string;
                violation_count: number;
                sp_level: number;
                is_expelled: boolean;
            };
            spTriggered: boolean;
        };
    }>;
    syncViolationsFromWalas(body: {
        start_date: string;
        end_date: string;
        force_sync?: boolean;
    }): Promise<{
        success: boolean;
        message: string;
        data: {
            success: boolean;
            synced_violations: number;
            failed: number;
            errors: any[];
        };
    }>;
    getViolations(student_id?: number, class_id?: number, category_id?: string, processed?: string, date_from?: string, date_to?: string, page?: number, limit?: number): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/violation.entity").Violation[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
    }>;
    getStudentViolations(studentId: number, page?: number, limit?: number): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/violation.entity").Violation[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
    }>;
    getSpLetters(student_id?: number, sp_level?: number, tahun?: number, status?: string, page?: number, limit?: number): Promise<{
        success: boolean;
        message: string;
        data: SpLetter[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
    }>;
    getSpProgression(studentId: number, tahun?: number): Promise<{
        success: boolean;
        message: string;
        data: {
            progression: import("./entities/violation.entity").SpProgression | null;
            spLetters: SpLetter[];
            timeline: any[];
        };
    }>;
    submitExcuse(violationId: string, dto: any, user: any): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/violation.entity").ViolationExcuse;
    }>;
    getExcuses(student_id?: number, status?: string, is_resolved?: string, page?: number, limit?: number): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/violation.entity").ViolationExcuse[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
    }>;
    reviewExcuse(excuseId: string, dto: any, user: any): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/violation.entity").ViolationExcuse | null;
    }>;
    getStudentRiskLevel(studentId: number, tahun?: number): Promise<{
        success: boolean;
        message: string;
        data: {
            risk_level: string;
            violation_count: number;
            sp_level: number;
            is_expelled: boolean;
        };
    }>;
    exportReport(studentId: number, tahun?: number): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    signSpLetter(spLetterId: string, dto: any, user: any): Promise<{
        success: boolean;
        message: string;
        data: SpLetter | null;
    }>;
    exportSpPdf(spLetterId: string, res: Response): Promise<void>;
    private buildProgressionTimeline;
}
