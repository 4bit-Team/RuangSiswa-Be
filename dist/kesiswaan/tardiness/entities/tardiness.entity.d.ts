export declare class TardinessRecord {
    id: string;
    student_id: number;
    student_name: string;
    class_id: number;
    tanggal: string;
    keterlambatan_menit: number;
    status: string;
    alasan: string;
    bukti_foto: string;
    catatan_petugas: string;
    has_appeal: boolean;
    created_at: Date;
    updated_at: Date;
    created_by: string;
    verified_by: string;
}
export declare class TardinessAppeal {
    id: string;
    tardiness_record_id: string;
    student_id: number;
    alasan_appeal: string;
    bukti_appeal: string;
    status: string;
    catatan_bk: string;
    is_resolved: boolean;
    resolved_by: string;
    resolved_at: Date;
    created_at: Date;
    updated_at: Date;
}
export declare class TardinessSummary {
    id: string;
    student_id: number;
    class_id: number;
    tahun_bulan: string;
    count_total: number;
    count_verified: number;
    count_disputed: number;
    total_menit: number;
    threshold_status: string;
    is_flagged: boolean;
    reason_if_flagged: string;
    created_at: Date;
    updated_at: Date;
}
export declare class TardinessAlert {
    id: string;
    student_id: number;
    student_name: string;
    alert_type: string;
    description: string;
    severity: string;
    alert_data: string;
    is_resolved: boolean;
    resolved_by: string;
    resolved_at: Date;
    created_at: Date;
    updated_at: Date;
}
export declare class TardinessPattern {
    id: string;
    student_id: number;
    pattern_type: string;
    pattern_description: string;
    confidence_score: number;
    occurrences: number;
    created_at: Date;
    updated_at: Date;
}
