import { Repository } from 'typeorm';
import { PointPelanggaran } from './entities/point-pelanggaran.entity';
import { CreatePointPelanggaranDto } from './dto/create-point-pelanggaran.dto';
import { UpdatePointPelanggaranDto } from './dto/update-point-pelanggaran.dto';
import { PointPelanggaranPdfService } from './services/point-pelanggaran-pdf.service';
import { PointPelanggaranImportData } from './dto/import-point-pelanggaran.dto';
export declare class PointPelanggaranService {
    private pointPelanggaranRepository;
    private pdfService;
    private readonly logger;
    constructor(pointPelanggaranRepository: Repository<PointPelanggaran>, pdfService: PointPelanggaranPdfService);
    create(dto: CreatePointPelanggaranDto): Promise<PointPelanggaran>;
    findAll(tahunPoint?: number, isActive?: boolean): Promise<PointPelanggaran[]>;
    findByYear(tahun: number): Promise<PointPelanggaran[]>;
    findActive(): Promise<PointPelanggaran[]>;
    findByCategory(category: string, tahun?: number): Promise<PointPelanggaran[]>;
    getCategories(): Promise<string[]>;
    findById(id: number): Promise<PointPelanggaran>;
    findByKode(kode: number): Promise<PointPelanggaran>;
    update(id: number, dto: UpdatePointPelanggaranDto): Promise<PointPelanggaran>;
    delete(id: number): Promise<void>;
    findSanksi(tahun?: number): Promise<PointPelanggaran[]>;
    findDoMutasi(tahun?: number): Promise<PointPelanggaran[]>;
    private deactivateOtherActiveYear;
    setActive(id: number): Promise<PointPelanggaran>;
    setInactive(id: number): Promise<PointPelanggaran>;
    calculateTotalBobot(kodes: number[]): Promise<number>;
    getSummaryByYear(): Promise<Array<{
        tahun: number;
        totalPelanggaran: number;
        activeYear: boolean;
    }>>;
    getSummaryByCategory(): Promise<Array<{
        category: string;
        totalPelanggaran: number;
        maxBobot: number;
    }>>;
    importPointsFromPdf(fileBuffer: Buffer): Promise<{
        success: boolean;
        tahun_point: number;
        total_imported: number;
        total_skipped: number;
        errors: Array<{
            kode: string;
            error: string;
        }>;
        imported_data: PointPelanggaranImportData[];
    }>;
    private convertKodeToNumber;
}
