export declare class Keterlambatan {
    id: number;
    studentId: number;
    studentName: string;
    className: string;
    date: string;
    time: string;
    minutesLate: number;
    reason?: string;
    status: 'recorded' | 'verified' | 'appealed' | 'resolved';
    walasId?: number;
    walasName?: string;
    verificationNotes?: string;
    createdAt: Date;
    updatedAt: Date;
    source: string;
}
