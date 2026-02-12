export declare class ImportPointPelanggaranDto {
    tahun_point: number;
    file: Express.Multer.File;
}
export interface ExtractedPointData {
    kode: string;
    jenis_pelanggaran: string;
    category_point: string;
    bobot: number;
    sanksi?: string;
    deskripsi?: string;
}
export interface ImportPdfResponse {
    success: boolean;
    tahun_point: number;
    total_imported: number;
    total_skipped: number;
    errors: Array<{
        kode: string;
        error: string;
    }>;
    imported_data: PointPelanggaranImportData[];
}
export interface PointPelanggaranImportData {
    id: number;
    tahun_point: number;
    category_point: string;
    nama_pelanggaran: string;
    kode: number;
    bobot: number;
    isActive: boolean;
    isSanksi: boolean;
    isDo: boolean;
}
