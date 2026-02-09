export declare class ViolationCategory {
    id: string;
    name: string;
    code: string;
    description: string;
    sp_trigger_count: number;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}
export declare class Violation {
    id: string;
    student_id: number;
    student_name: string;
    class_id: number;
    violation_category_id: string;
    description: string;
    bukti_foto: string;
    catatan_petugas: string;
    severity: number;
    is_processed: boolean;
    sp_letter_id: string;
    tanggal_pelanggaran: string;
    created_at: Date;
    updated_at: Date;
    created_by: string;
}
export declare class SpLetter {
    id: string;
    student_id: number;
    student_name: string;
    class_id: number;
    nis: string;
    sp_level: number;
    sp_number: string;
    sp_type: string;
    tahun: number;
    violations_text: string;
    violation_ids: string;
    consequences: string;
    alamat_siswa: string;
    kompetensi_keahlian: string;
    tanggal_sp: string;
    status: string;
    is_signed: boolean;
    signed_date: string;
    signed_by_parent: string;
    signed_by_bp_bk: string;
    signed_by_wali_kelas: string;
    material_cost: number;
    pdf_path: string;
    notes: string;
    created_at: Date;
    updated_at: Date;
}
export declare class SpProgression {
    id: string;
    student_id: number;
    tahun: number;
    current_sp_level: number;
    violation_count: number;
    sp1_issued_count: number;
    sp2_issued_count: number;
    sp3_issued_count: number;
    first_sp_date: string;
    last_sp_date: string;
    is_expelled: boolean;
    expulsion_date: string;
    reason_if_expelled: string;
    notes: string;
    created_at: Date;
    updated_at: Date;
}
export declare class ViolationExcuse {
    id: string;
    violation_id: string;
    student_id: number;
    excuse_text: string;
    bukti_excuse: string;
    status: string;
    catatan_bk: string;
    is_resolved: boolean;
    resolved_by: string;
    resolved_at: Date;
    created_at: Date;
    updated_at: Date;
}
export declare class ViolationStatistics {
    id: string;
    student_id: number;
    tahun: number;
    total_violations: number;
    total_severity_score: number;
    average_severity: number;
    sp_count: number;
    risk_level: string;
    most_common_violation: string;
    created_at: Date;
    updated_at: Date;
}
