export declare class CreatePembinaanOrtuDto {
    pembinaan_id: number;
    student_id: number;
    student_name: string;
    student_class: string;
    parent_id?: number;
    parent_name: string;
    parent_phone?: string;
    violation_details: string;
    letter_content: string;
    scheduled_date: string;
    scheduled_time?: string;
    location?: string;
    communication_method?: 'sms' | 'whatsapp' | 'email' | 'manual';
    kesiswaan_notes?: string;
}
export declare class UpdatePembinaanOrtuDto {
    parent_response?: string;
    meeting_result?: string;
    requires_follow_up?: boolean;
    follow_up_notes?: string;
    status?: 'pending' | 'sent' | 'read' | 'responded' | 'closed';
    scheduled_date?: string;
    scheduled_time?: string;
}
export declare class SendLetterDto {
    communication_method: 'sms' | 'whatsapp' | 'email' | 'manual';
}
export declare class RecordMeetingDto {
    meeting_result: string;
    parent_response?: string;
    requires_follow_up?: boolean;
    follow_up_notes?: string;
}
export declare class RespondFromParentDto {
    parent_response: string;
}
export declare class ParentViewDto {
    id?: number;
    student_name?: string;
    student_class?: string;
    violation_details?: string;
    letter_content?: string;
    scheduled_date?: Date;
    scheduled_time?: string;
    location?: string;
    status?: string;
}
