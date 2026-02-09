export declare class AttendanceSummary {
    id: number;
    student_id: number;
    class_id: number;
    tahun_bulan: string;
    total_hadir: number;
    total_sakit: number;
    total_izin: number;
    total_alpa: number;
    total_days_expected: number;
    attendance_percentage: number;
    is_flagged: boolean;
    reason_if_flagged: string;
    created_at: Date;
    updated_at: Date;
}
