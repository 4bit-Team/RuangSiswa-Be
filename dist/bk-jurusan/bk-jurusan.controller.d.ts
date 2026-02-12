import { BkJurusanService } from './bk-jurusan.service';
import { UpdateBkJurusanDto } from './dto/create-bk-jurusan.dto';
export declare class BkJurusanController {
    private readonly bkJurusanService;
    constructor(bkJurusanService: BkJurusanService);
    getMyJurusan(req: any): Promise<import("./entities/bk-jurusan.entity").BkJurusan[]>;
    addJurusan(jurusanId: string, req: any): Promise<import("./entities/bk-jurusan.entity").BkJurusan>;
    removeJurusan(jurusanId: string, req: any): Promise<{
        success: boolean;
    }>;
    updateJurusanList(updateDto: UpdateBkJurusanDto, req: any): Promise<import("./entities/bk-jurusan.entity").BkJurusan[]>;
    isConfigured(req: any): Promise<{
        isConfigured: boolean;
    }>;
    getBKsByJurusan(jurusanId: string): Promise<import("./entities/bk-jurusan.entity").BkJurusan[]>;
}
