import { PointPelanggaranService } from './point-pelanggaran.service';
import { CreatePointPelanggaranDto } from './dto/create-point-pelanggaran.dto';
import { UpdatePointPelanggaranDto } from './dto/update-point-pelanggaran.dto';
export declare class PointPelanggaranController {
    private readonly pointPelanggaranService;
    constructor(pointPelanggaranService: PointPelanggaranService);
    getCategories(): Promise<string[]>;
    getByCategory(category: string, tahun?: string): Promise<import("./entities/point-pelanggaran.entity").PointPelanggaran[]>;
    getSummaryByCategory(): Promise<{
        category: string;
        totalPelanggaran: number;
        maxBobot: number;
    }[]>;
    findAll(tahun?: string, isActive?: string): Promise<import("./entities/point-pelanggaran.entity").PointPelanggaran[]>;
    findByYear(tahun: number): Promise<import("./entities/point-pelanggaran.entity").PointPelanggaran[]>;
    findActive(): Promise<import("./entities/point-pelanggaran.entity").PointPelanggaran[]>;
    findSanksi(tahun?: string): Promise<import("./entities/point-pelanggaran.entity").PointPelanggaran[]>;
    findDoMutasi(tahun?: string): Promise<import("./entities/point-pelanggaran.entity").PointPelanggaran[]>;
    getSummary(): Promise<{
        tahun: number;
        totalPelanggaran: number;
        activeYear: boolean;
    }[]>;
    importPdf(file: Express.Multer.File): Promise<{
        success: boolean;
        tahun_point: number;
        total_imported: number;
        total_skipped: number;
        errors: Array<{
            kode: string;
            error: string;
        }>;
        imported_data: import("./dto/import-point-pelanggaran.dto").PointPelanggaranImportData[];
    }>;
    calculateBobot(kodes: number[]): Promise<{
        kodes: number[];
        total: number;
    }>;
    findById(id: number): Promise<import("./entities/point-pelanggaran.entity").PointPelanggaran>;
    create(dto: CreatePointPelanggaranDto): Promise<import("./entities/point-pelanggaran.entity").PointPelanggaran>;
    update(id: number, dto: UpdatePointPelanggaranDto): Promise<import("./entities/point-pelanggaran.entity").PointPelanggaran>;
    setActive(id: number): Promise<import("./entities/point-pelanggaran.entity").PointPelanggaran>;
    setInactive(id: number): Promise<import("./entities/point-pelanggaran.entity").PointPelanggaran>;
    delete(id: number): Promise<{
        message: string;
    }>;
}
