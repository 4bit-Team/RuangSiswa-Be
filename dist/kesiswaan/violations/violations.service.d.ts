import { Repository } from 'typeorm';
import { Violation, ViolationCategory, SpLetter, SpProgression, ViolationExcuse, ViolationStatistics } from './entities/violation.entity';
import { SpPdfService } from './sp-pdf.service';
interface ReportViolationDto {
    student_id: number;
    student_name: string;
    class_id: number;
    violation_category_id: string;
    description: string;
    tanggal_pelanggaran: string;
    bukti_foto?: string;
    catatan_petugas?: string;
    severity?: number;
    created_by: string;
}
interface SubmitExcuseDto {
    violation_id: string;
    excuse_text: string;
    bukti_excuse?: string;
}
interface ReviewExcuseDto {
    excuse_id: string;
    status: 'accepted' | 'rejected';
    catatan_bk?: string;
    resolved_by: string;
}
export declare class ViolationService {
    private violationRepo;
    private categoryRepo;
    private spLetterRepo;
    private progressionRepo;
    private excuseRepo;
    private statsRepo;
    private readonly spPdfService;
    private readonly logger;
    private readonly SP_RULES;
    constructor(violationRepo: Repository<Violation>, categoryRepo: Repository<ViolationCategory>, spLetterRepo: Repository<SpLetter>, progressionRepo: Repository<SpProgression>, excuseRepo: Repository<ViolationExcuse>, statsRepo: Repository<ViolationStatistics>, spPdfService: SpPdfService);
    reportViolation(dto: ReportViolationDto): Promise<Violation>;
    getViolations(filters: {
        student_id?: number;
        class_id?: number;
        category_id?: string;
        processed?: boolean;
        date_from?: string;
        date_to?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: Violation[];
        total: number;
        page: number;
        limit: number;
    }>;
    getUnprocessedViolations(student_id: number): Promise<Violation[]>;
    getSpProgression(student_id: number, tahun?: number): Promise<SpProgression | null>;
    getSpLetters(filters: {
        student_id?: number;
        sp_level?: number;
        tahun?: number;
        status?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: SpLetter[];
        total: number;
        page: number;
        limit: number;
    }>;
    checkAndGenerateSp(student_id: number): Promise<SpLetter | null>;
    private generateSpLetter;
    signSpLetter(sp_letter_id: string, signed_by_parent: string): Promise<SpLetter | null>;
    submitExcuse(dto: SubmitExcuseDto): Promise<ViolationExcuse>;
    getExcuses(filters: {
        student_id?: number;
        status?: string;
        is_resolved?: boolean;
        page?: number;
        limit?: number;
    }): Promise<{
        data: ViolationExcuse[];
        total: number;
        page: number;
        limit: number;
    }>;
    reviewExcuse(dto: ReviewExcuseDto): Promise<ViolationExcuse | null>;
    getStudentRiskLevel(student_id: number, tahun?: number): Promise<{
        risk_level: string;
        violation_count: number;
        sp_level: number;
        is_expelled: boolean;
    }>;
    exportReport(student_id: number, tahun?: number): Promise<any>;
    private updateStatistics;
}
export {};
