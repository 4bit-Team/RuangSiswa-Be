/**
 * DTO untuk Import Point Pelanggaran dari PDF
 */
export class ImportPointPelanggaranDto {
  tahun_point: number; // Tahun yang diekstrak dari PDF
  file: Express.Multer.File; // File PDF
}

/**
 * Interface untuk data point yang diekstrak dari PDF
 */
export interface ExtractedPointData {
  kode: string;
  jenis_pelanggaran: string;
  category_point: string;
  bobot: number;
  sanksi?: string;
  deskripsi?: string;
}

/**
 * Response untuk import PDF
 */
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

/**
 * Data point pelanggaran yang berhasil diimport
 */
export interface PointPelanggaranImportData {
  id: number;
  tahun_point: number;
  category_point: string;
  nama_pelanggaran: string;
  kode: string;
  bobot: number;
  isActive: boolean;
  isSanksi: boolean;
  isDo: boolean;
}
