export declare class AttendanceRecord {
    id: number;
    student_id: number;
    student_name: string;
    class_id: number;
    tanggal: Date;
    status: 'H' | 'S' | 'I' | 'A';
    notes: string;
    synced_from_walas: boolean;
    synced_at: Date;
    created_at: Date;
    updated_at: Date;
}
