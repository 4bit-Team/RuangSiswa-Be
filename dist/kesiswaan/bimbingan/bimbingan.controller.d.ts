import { BimbinganService } from './bimbingan.service';
export declare class BimbinganController {
    private readonly bimbinganService;
    private readonly logger;
    constructor(bimbinganService: BimbinganService);
    createReferral(dto: any, user: any): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/bimbingan.entity").GuidanceReferral;
    }>;
    getReferrals(student_id?: number, counselor_id?: string, status?: string, risk_level?: string, tahun?: number, page?: number, limit?: number): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/bimbingan.entity").GuidanceReferral[];
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
        data: import("./entities/bimbingan.entity").GuidanceReferral | null;
    }>;
    createSesi(dto: any, user: any): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/bimbingan.entity").GuidanceSession;
    }>;
    getSesi(referral_id?: string, student_id?: number, counselor_id?: string, status?: string, page?: number, limit?: number): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/bimbingan.entity").GuidanceSession[];
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
        data: import("./entities/bimbingan.entity").GuidanceSession | null;
    }>;
    addCatat(dto: any, user: any): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/bimbingan.entity").GuidanceNote;
    }>;
    getCatat(referral_id?: string, student_id?: number, counselor_id?: string, page?: number, limit?: number): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/bimbingan.entity").GuidanceNote[];
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
        data: import("./entities/bimbingan.entity").GuidanceIntervention;
    }>;
    getIntervensi(referral_id?: string, student_id?: number, status?: string, page?: number, limit?: number): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/bimbingan.entity").GuidanceIntervention[];
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
        data: import("./entities/bimbingan.entity").GuidanceIntervention | null;
    }>;
    recordPerkembangan(dto: any, user: any): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/bimbingan.entity").GuidanceProgress;
    }>;
    getPerkembangan(referral_id?: string, student_id?: number, page?: number, limit?: number): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/bimbingan.entity").GuidanceProgress[];
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
        data: import("./entities/bimbingan.entity").GuidanceTarget;
    }>;
    getTarget(referral_id?: string, student_id?: number, status?: string, page?: number, limit?: number): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/bimbingan.entity").GuidanceTarget[];
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
        data: import("./entities/bimbingan.entity").GuidanceStatus | null;
    }>;
}
