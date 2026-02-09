export declare class CreateGroupReservasiDto {
    groupName: string;
    creatorId: number;
    studentIds: number[];
    counselorId: number;
    preferredDate: Date;
    preferredTime: string;
    type: 'chat' | 'tatap-muka';
    topicId?: number;
    notes?: string;
    room?: string;
}
export declare class UpdateGroupReservasiStatusDto {
    status: 'approved' | 'rejected' | 'in_counseling' | 'completed' | 'cancelled';
    rejectionReason?: string;
}
