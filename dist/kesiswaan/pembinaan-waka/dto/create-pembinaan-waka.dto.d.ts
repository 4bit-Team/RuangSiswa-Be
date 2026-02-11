export type WakDecision = 'sp3' | 'do';
export declare class CreatePembinaanWakaDto {
    reservasi_id: number;
    pembinaan_id: number;
    waka_id: number;
    notes?: string;
}
export declare class DecidePembinaanWakaDto {
    wak_decision: WakDecision;
    decision_reason: string;
    notes?: string;
}
export declare class AcknowledgePembinaanWakaDto {
    acknowledged: boolean;
    student_response?: string;
}
export declare class AppealPembinaanWakaDto {
    appeal_reason: string;
    additional_notes?: string;
}
export declare class NotifyParentDto {
    notification_message?: string;
}
export declare class UpdatePembinaanWakaDto {
    notes?: string;
    parent_notified?: boolean;
    parent_notification_date?: string;
}
