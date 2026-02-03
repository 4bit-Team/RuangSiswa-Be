import type { Response } from 'express';
import { LaporanBkService } from './laporan-bk.service';
import { CreateLaporanBkDto } from './dto/create-laporan-bk.dto';
import { UpdateLaporanBkDto } from './dto/update-laporan-bk.dto';
export declare class LaporanBkController {
    private readonly laporanBkService;
    constructor(laporanBkService: LaporanBkService);
    create(createLaporanBkDto: CreateLaporanBkDto): Promise<import("./entities/laporan-bk.entity").LaporanBk>;
    findAll(): Promise<import("./entities/laporan-bk.entity").LaporanBk[]>;
    findOne(id: string): Promise<import("./entities/laporan-bk.entity").LaporanBk>;
    update(id: string, updateLaporanBkDto: UpdateLaporanBkDto): Promise<import("./entities/laporan-bk.entity").LaporanBk>;
    remove(id: string): Promise<import("./entities/laporan-bk.entity").LaporanBk>;
    exportExcel(res: Response): Promise<void>;
    downloadTemplate(res: Response): Promise<void>;
    importExcel(file: Express.Multer.File): Promise<{
        success: number;
        failed: number;
        errors: any[];
    }>;
}
