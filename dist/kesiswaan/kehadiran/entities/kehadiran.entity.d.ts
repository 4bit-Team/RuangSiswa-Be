export declare class Kehadiran {
    id: number;
    studentId: number;
    studentName: string;
    className: string;
    date: string;
    status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa';
    time?: string;
    notes?: string;
    walasId?: number;
    walasName?: string;
    createdAt: Date;
    updatedAt: Date;
    source: string;
}
