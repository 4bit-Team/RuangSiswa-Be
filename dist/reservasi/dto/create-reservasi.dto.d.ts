export declare class CreateReservasiDto {
    studentId: number;
    counselorId: number;
    preferredDate: Date;
    preferredTime: string;
    type: 'chat' | 'tatap-muka';
    counselingType?: 'umum' | 'kelompok' | 'khusus';
    topicId?: number;
    notes?: string;
    room?: string;
}
export declare class CreatePembinaanReservasiDto {
    pembinaan_id: number;
    counselorId: number;
    pembinaanType: 'ringan' | 'berat';
    preferredDate: Date;
    preferredTime: string;
    type: 'chat' | 'tatap-muka';
    notes?: string;
    room?: string;
}
export declare class UpdateReservasiStatusDto {
    status: 'approved' | 'rejected' | 'in_counseling' | 'completed' | 'cancelled';
    rejectionReason?: string;
}
