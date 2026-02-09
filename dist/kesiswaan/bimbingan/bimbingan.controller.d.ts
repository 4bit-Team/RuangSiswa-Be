import { BimbinganService } from './bimbingan.service';
export declare class BimbinganController {
    private readonly bimbinganService;
    private readonly logger;
    constructor(bimbinganService: BimbinganService);
    createReferral(dto: any, user: any): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/bimbingan.entity").BimbinganReferral;
    }>;
    getReferrals(student_id?: number, counselor_id?: string, status?: string, risk_level?: string, tahun?: number, page?: number, limit?: number): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/bimbingan.entity").BimbinganReferral[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
    }>;
    assignCounselor(referralId: string, dto: any, user: any): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/bimbingan.entity").BimbinganReferral | null;
    }>;
    syncGuidanceFromWalas(body: {
        start_date: string;
        end_date: string;
        force_sync?: boolean;
    }): Promise<{
        success: boolean;
        message: string;
        data: {
            success: boolean;
            synced_referrals: number;
            failed: number;
            errors: any[];
        };
    }>;
    createSesi(dto: any, user: any): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/bimbingan.entity").BimbinganSesi;
    }>;
    getSesi(referral_id?: string, student_id?: number, counselor_id?: string, status?: string, page?: number, limit?: number): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/bimbingan.entity").BimbinganSesi[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
    }>;
    completeSesi(sesiId: string, dto: any): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/bimbingan.entity").BimbinganSesi | null;
    }>;
    addCatat(dto: any, user: any): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/bimbingan.entity").BimbinganCatat;
    }>;
    getCatat(referral_id?: string, student_id?: number, counselor_id?: string, page?: number, limit?: number): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/bimbingan.entity").BimbinganCatat[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
    }>;
    createIntervensi(dto: any, user: any): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/bimbingan.entity").BimbinganIntervensi;
    }>;
    getIntervensi(referral_id?: string, student_id?: number, status?: string, page?: number, limit?: number): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/bimbingan.entity").BimbinganIntervensi[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
    }>;
    evaluateIntervensi(intervensiId: string, dto: any): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/bimbingan.entity").BimbinganIntervensi | null;
    }>;
    recordPerkembangan(dto: any, user: any): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/bimbingan.entity").BimbinganPerkembangan;
    }>;
    getPerkembangan(referral_id?: string, student_id?: number, page?: number, limit?: number): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/bimbingan.entity").BimbinganPerkembangan[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
    }>;
    createTarget(dto: any, user: any): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/bimbingan.entity").BimbinganTarget;
    }>;
    getTarget(referral_id?: string, student_id?: number, status?: string, page?: number, limit?: number): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/bimbingan.entity").BimbinganTarget[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
    }>;
    getStudentStatus(studentId: number, tahun?: number): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/bimbingan.entity").BimbinganStatus | null;
    }>;
    getAllStatuses(tahun?: number, risk_level?: string, status?: string, page?: number, limit?: number): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/bimbingan.entity").BimbinganStatus[];
        pagination: {
            page: number;
            limit: number;
            total: number;
        };
    }>;
}
