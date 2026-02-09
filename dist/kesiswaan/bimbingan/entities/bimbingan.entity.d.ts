export declare class BimbinganCategory {
    id: string;
    name: string;
    code: string;
    description: string;
    priority_level: number;
    recommended_duration_weeks: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}
export declare class GuidanceCase {
    id: string;
    student_id: number;
    student_name: string;
    class_id: number;
    class_name: string;
    guidance_category_id: string;
    category_code: string;
    referred_from: string;
    referred_from_id: string;
    case_description: string;
    background_info: string;
    case_opened_date: string;
    case_closed_date: string;
    status: string;
    risk_level: string;
    risk_score: number;
    attendance_risk_score: number;
    tardiness_risk_score: number;
    violation_risk_score: number;
    recommended_interventions: string;
    total_sessions_planned: number;
    total_sessions_completed: number;
    tahun: number;
    assigned_to_bk: string;
    assigned_to_bk_name: string;
    is_escalated: boolean;
    escalation_reason: string;
    created_at: Date;
    updated_at: Date;
}
export declare class BimbinganSesi {
    id: string;
    guidance_case_id: string;
    referral_id: string;
    student_id: number;
    sesi_ke: number;
    bk_staff_id: string;
    bk_staff_name: string;
    session_date: string;
    tanggal_sesi: Date;
    duration_minutes: number;
    status: string;
    session_type: string;
    location: string;
    agenda: string;
    notes: string;
    student_response: string;
    recommendations: string;
    student_attended: boolean;
    siswa_hadir: boolean;
    outcome: string;
    effectiveness_rating: number;
    followup_actions: string;
    next_session_date: string;
    follow_up_date: Date;
    orang_tua_hadir: boolean;
    hasil_akhir: string;
    follow_up_status: string;
    created_at: Date;
    updated_at: Date;
}
export declare class BimbinganCatat {
    id: string;
    guidance_case_id: string;
    student_id: number;
    note_content: string;
    note_type: string;
    sentiment: string;
    created_by: string;
    created_by_name: string;
    created_by_role: string;
    attachments: string[];
    status: string;
    created_at: Date;
    updated_at: Date;
}
export declare class BimbinganIntervensi {
    id: string;
    guidance_case_id: string;
    student_id: number;
    intervention_name: string;
    intervention_description: string;
    intervention_type: string;
    start_date: string;
    end_date: string;
    status: string;
    responsible_party_id: string;
    responsible_party_name: string;
    progress_notes: string;
    completion_percentage: number;
    outcomes: string;
    hasil_intervensi: string;
    tanggal_evaluasi: string;
    efektivitas: number;
    orang_tua_hadir: boolean;
    created_at: Date;
    updated_at: Date;
}
export declare class GuidanceParentCommunication {
    id: string;
    guidance_case_id: string;
    student_id: number;
    parent_name: string;
    parent_contact: string;
    communication_date: string;
    communication_type: string;
    communication_content: string;
    parent_response: string;
    parent_agreed_to_involve: boolean;
    communicated_by: string;
    communicated_by_name: string;
    created_at: Date;
    updated_at: Date;
}
export declare class BimbinganPerkembangan {
    id: string;
    guidance_case_id: string;
    referral_id: string;
    student_id: number;
    student_name: string;
    counselor_id: string;
    assessment_date: string;
    tanggal_evaluasi: string;
    status_keseluruhan: string;
    previous_attendance_percentage: number;
    current_attendance_percentage: number;
    previous_tardiness_count: number;
    current_tardiness_count: number;
    previous_violation_count: number;
    current_violation_count: number;
    previous_gpa: number;
    current_gpa: number;
    behavioral_observations: string;
    overall_improvement_score: number;
    progress_assessment: string;
    assessment_comments: string;
    assessed_by: string;
    assessed_by_name: string;
    created_at: Date;
    updated_at: Date;
}
export declare class BimbinganReferral {
    id: string;
    guidance_case_id: string;
    student_id: number;
    student_name: string;
    class_id: number;
    tahun: number;
    referral_type: string;
    referral_reason: string;
    risk_level: string;
    external_agency: string;
    contact_person: string;
    contact_number: string;
    referral_date: Date;
    referral_status: string;
    status: string;
    completed_date: Date;
    notes: string;
    referral_source: {
        source: string;
        source_id: string;
        details: string;
    } | null;
    first_appointment_date: string;
    counselor_id: string;
    counselor_name: string;
    assigned_date: string;
    external_assessment_report: string;
    recommendations_from_external: string;
    referred_by: string;
    created_at: Date;
    updated_at: Date;
}
export declare class BimbinganStatistik {
    id: string;
    tahun: number;
    total_cases_open: number;
    total_cases_closed: number;
    total_cases_referred: number;
    total_sessions_completed: number;
    critical_risk_count: number;
    high_risk_count: number;
    medium_risk_count: number;
    low_risk_count: number;
    average_case_duration_weeks: number;
    case_resolution_rate_percentage: number;
    average_improvement_score: number;
    most_common_category: string;
    parent_involvement_percentage: number;
    created_at: Date;
    updated_at: Date;
}
export declare class BimbinganAbility {
    id: string;
    guidance_case_id: string;
    skill_type: string;
    proficiency_level: number;
    assessment_notes: string;
    created_at: Date;
    updated_at: Date;
}
export declare class BimbinganTarget {
    id: string;
    guidance_case_id: string;
    target_description: string;
    status: string;
    target_date: Date;
    progress_percentage: number;
    created_at: Date;
    updated_at: Date;
}
export declare class BimbinganStatus {
    id: string;
    guidance_case_id: string;
    student_id: number;
    tahun: number;
    status_type: string;
    status: string;
    previous_status: string;
    current_risk_level: string;
    status_notes: string;
    total_referrals: number;
    total_sessions: number;
    total_interventions: number;
    first_referral_date: Date;
    latest_referral_id: string;
    last_session_date: Date;
    next_session_date: Date;
    created_at: Date;
    updated_at: Date;
}
export { BimbinganCategory as GuidanceCategory };
export { BimbinganReferral as GuidanceReferral };
export { BimbinganSesi as GuidanceSession };
export { BimbinganCatat as GuidanceNote };
export { BimbinganIntervensi as GuidanceIntervention };
export { BimbinganPerkembangan as GuidanceProgress };
export { BimbinganAbility as GuidanceAbility };
export { BimbinganTarget as GuidanceTarget };
export { BimbinganStatus as GuidanceStatus };
export { BimbinganStatistik as GuidanceStatistics };
