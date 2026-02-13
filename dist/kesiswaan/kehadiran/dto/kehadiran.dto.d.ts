export declare class CreateKehadiranDto {
    studentId: number;
    studentName: string;
    className: string;
    date: string;
    status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa';
    time?: string;
    notes?: string;
    walasId?: number;
    walasName?: string;
    source?: string;
}
export declare class UpdateKehadiranDto {
    status?: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa';
    time?: string;
    notes?: string;
}
export declare class FilterKehadiranDto {
    startDate?: string;
    endDate?: string;
    studentId?: number;
    className?: string;
    status?: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa';
    page?: number;
    limit?: number;
}
