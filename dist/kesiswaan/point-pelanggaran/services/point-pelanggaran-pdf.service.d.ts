import { ExtractedPointData } from '../dto/import-point-pelanggaran.dto';
interface PdfExtractionResult {
    tahun_point: number;
    points: ExtractedPointData[];
    validation: {
        isValid: boolean;
        header_found: boolean;
        errors: string[];
    };
    debugLog?: {
        pointsPerPage: {
            [page: number]: number;
        };
        totalExtracted: number;
    };
}
export declare class PointPelanggaranPdfService {
    private readonly logger;
    extractPointsFromPdf(fileBuffer: Buffer): Promise<PdfExtractionResult>;
    private validatePdfHeader;
    private extractYearFromPdf;
    private extractPointsData;
    private parseBobotValue;
}
export {};
