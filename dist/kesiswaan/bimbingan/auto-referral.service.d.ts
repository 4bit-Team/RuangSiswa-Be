import { Repository } from 'typeorm';
import { BimbinganReferral } from './entities/bimbingan.entity';
import { BimbinganService } from './bimbingan.service';
export declare class AutoReferralService {
    private readonly referralRepository;
    private readonly bimbinganService;
    private readonly logger;
    constructor(referralRepository: Repository<BimbinganReferral>, bimbinganService: BimbinganService);
    handleViolationReferral(studentId: number, studentName: string, spLevel: string, violationCount: number, violationDetails: any[], tahun: number): Promise<BimbinganReferral>;
    handleTardinessReferral(studentId: number, studentName: string, tardinessCount: number, rejectedAppealCount: number, tahun: number): Promise<BimbinganReferral>;
    handleAttendanceReferral(studentId: number, studentName: string, attendanceRate: number, totalAbsences: number, totalDaysInSchool: number, tahun: number): Promise<BimbinganReferral>;
    handleAcademicReferral(studentId: number, studentName: string, gpa: number, failingSubjectsCount: number, tahun: number): Promise<BimbinganReferral>;
    periodicCheckAndReferral(tahun: number): Promise<any>;
    getAtRiskStudentsSummary(tahun: number): Promise<{
        total: number;
        by_risk_level: {
            red: number;
            orange: number;
        };
        by_source: {
            violations: number;
            tardiness: number;
            attendance: number;
            academic: number;
        };
        students: {
            id: string;
            student_id: number;
            student_name: string;
            risk_level: string;
            source: string;
            status: string;
            referral_date: Date;
            assigned_to: string;
        }[];
    }>;
    deactivateReferral(studentId: number, tahun: number, reason: string): Promise<BimbinganReferral | null>;
}
