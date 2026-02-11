import { PembinaanService } from './pembinaan.service';
import { SyncPembinaanDto } from './dto/sync-pembinaan.dto';
import { UpdatePembinaanDto } from './dto/update-pembinaan.dto';
export declare class PembinaanController {
    private readonly pembinaanService;
    private readonly logger;
    constructor(pembinaanService: PembinaanService);
    findAll(status?: string, siswas_id?: string, walas_id?: string): Promise<import("./entities/pembinaan.entity").Pembinaan[]>;
    getStatistics(startDate?: string, endDate?: string, siswas_id?: string, walas_id?: string): Promise<any>;
    getWalasStatistics(class_id?: string, walas_id?: string, start_date?: string, end_date?: string): Promise<any>;
    getUnmatched(): Promise<import("./entities/pembinaan.entity").Pembinaan[]>;
    search(query: string): Promise<import("./entities/pembinaan.entity").Pembinaan[]>;
    findById(id: number): Promise<import("./entities/pembinaan.entity").Pembinaan>;
    findByStudent(siswas_id: number): Promise<import("./entities/pembinaan.entity").Pembinaan[]>;
    findByWalas(walas_id: number): Promise<import("./entities/pembinaan.entity").Pembinaan[]>;
    syncFromWalas(dto: SyncPembinaanDto): Promise<import("./entities/pembinaan.entity").Pembinaan>;
    update(id: number, dto: UpdatePembinaanDto): Promise<import("./entities/pembinaan.entity").Pembinaan>;
    assignPoint(id: number, point_pelanggaran_id: number): Promise<import("./entities/pembinaan.entity").Pembinaan>;
    bulkUpdateStatus(ids: number[], status: string): Promise<{
        message: string;
        status: string;
    }>;
    delete(id: number): Promise<{
        message: string;
    }>;
}
