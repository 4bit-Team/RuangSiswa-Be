import { PointPelanggaran } from '../../point-pelanggaran/entities/point-pelanggaran.entity';
export declare class Pembinaan {
    id: number;
    walas_id: number;
    walas_name: string;
    siswas_id: number;
    student_user_id: number;
    siswas_name: string;
    point_pelanggaran_id: number;
    pointPelanggaran: PointPelanggaran;
    kasus: string;
    tindak_lanjut: string;
    keterangan: string;
    tanggal_pembinaan: string;
    status: string;
    match_type: string;
    match_confidence: number;
    match_explanation: string;
    class_id: number;
    class_name: string;
    hasil_pembinaan: string;
    catatan_bk: string;
    follow_up_type: string;
    follow_up_date: string;
    sp_level: 'SP1' | 'SP2' | null;
    createdAt: Date;
    updatedAt: Date;
}
