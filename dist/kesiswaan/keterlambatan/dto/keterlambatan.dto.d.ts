export declare class CreateKeterlambatanDto {
    studentId: number;
    studentName: string;
    className: string;
    date: string;
    time: string;
    minutesLate: number;
    reason?: string;
    status?: 'recorded' | 'verified' | 'appealed' | 'resolved';
    walasId?: number;
    walasName?: string;
    source?: string;
}
export declare class UpdateKeterlambatanDto {
    status?: 'recorded' | 'verified' | 'appealed' | 'resolved';
    reason?: string;
    verificationNotes?: string;
}
export declare class FilterKeterlambatanDto {
    startDate?: string;
    endDate?: string;
    studentId?: number;
    className?: string;
    status?: 'recorded' | 'verified' | 'appealed' | 'resolved';
    page?: number;
    limit?: number;
}
