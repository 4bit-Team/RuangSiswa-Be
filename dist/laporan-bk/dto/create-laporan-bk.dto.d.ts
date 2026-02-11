export declare class CreateLaporanBkDto {
    reservasi_id: number;
    pembinaan_id: number;
    student_id: number;
    student_name?: string;
    student_class?: string;
    bk_id: number;
    session_date?: string;
    session_duration_minutes?: number;
    session_type?: 'individu' | 'kelompok' | 'keluarga';
    session_location?: string;
    session_topic?: string;
    session_notes?: string;
}
export declare class UpdateLaporanBkDto {
    session_date?: string;
    session_duration_minutes?: number;
    session_type?: 'individu' | 'kelompok' | 'keluarga';
    session_location?: string;
    session_topic?: string;
    session_notes?: string;
    student_response?: string;
    student_understanding_level?: 'sangat_memahami' | 'memahami' | 'cukup' | 'kurang';
    student_participation_level?: 'sangat_aktif' | 'aktif' | 'cukup' | 'pasif';
    behavioral_improvement?: boolean;
    recommendations?: string;
    follow_up_date?: string;
    follow_up_status?: string;
    parent_notified?: boolean;
    parent_notification_date?: string;
    parent_notification_content?: string;
    escalated_to_waka?: boolean;
    escalation_reason?: string;
    status?: 'ongoing' | 'completed' | 'needs_escalation' | 'archived';
    final_assessment?: string;
    internal_notes?: string;
}
export declare class RecordSessionDto {
    session_date: string;
    session_duration_minutes?: number;
    session_type?: 'individu' | 'kelompok' | 'keluarga';
    session_location?: string;
    session_topic: string;
    session_notes: string;
    student_response?: string;
    student_understanding_level?: 'sangat_memahami' | 'memahami' | 'cukup' | 'kurang';
    student_participation_level?: 'sangat_aktif' | 'aktif' | 'cukup' | 'pasif';
    recommendations?: string;
    follow_up_date?: string;
}
export declare class EscalateToBkDto {
    escalation_reason: string;
    final_assessment?: string;
}
export declare class CompleteFollowUpDto {
    follow_up_status: string;
    follow_up_notes?: string;
}
