import { AutoReferralService } from '../bimbingan/auto-referral.service';
export declare class ViolationsIntegrationService {
    private readonly autoReferralService;
    private readonly logger;
    constructor(autoReferralService: AutoReferralService);
    onSP2Generated(studentId: number, studentName: string, violationCount: number, violationDetails: any[], tahun: number): Promise<void>;
    onSP3Generated(studentId: number, studentName: string, violationCount: number, violationDetails: any[], tahun: number): Promise<void>;
}
