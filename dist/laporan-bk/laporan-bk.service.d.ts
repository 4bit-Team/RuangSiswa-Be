import { Repository } from 'typeorm';
import { LaporanBk } from './entities/laporan-bk.entity';
import { CreateLaporanBkDto } from './dto/create-laporan-bk.dto';
import { UpdateLaporanBkDto } from './dto/update-laporan-bk.dto';
import { LaporanBkExcelService } from './laporan-bk-excel.service';
export declare class LaporanBkService {
    private readonly laporanBkRepo;
    private readonly excelService;
    constructor(laporanBkRepo: Repository<LaporanBk>, excelService: LaporanBkExcelService);
    create(createLaporanBkDto: CreateLaporanBkDto): Promise<LaporanBk>;
    findAll(): Promise<LaporanBk[]>;
    findOne(id: number): Promise<LaporanBk>;
    update(id: number, updateLaporanBkDto: UpdateLaporanBkDto): Promise<LaporanBk>;
    remove(id: number): Promise<LaporanBk>;
    exportToExcel(): Promise<{
        filePath: string;
        fileName: string;
    }>;
    generateTemplate(): Promise<{
        filePath: string;
        fileName: string;
    }>;
    importFromExcel(filePath: string): Promise<{
        success: number;
        failed: number;
        errors: any[];
    }>;
}
