export declare class CreateReservasiDto {
    studentId: number;
    counselorId: number;
    preferredDate: Date;
    preferredTime: string;
    type: 'chat' | 'tatap-muka';
    topicId?: number;
    notes?: string;
    room?: string;
}
export declare class UpdateReservasiStatusDto {
    status: 'approved' | 'rejected' | 'in_counseling' | 'completed' | 'cancelled';
    rejectionReason?: string;
}
