import { KeterlambatanService } from './keterlambatan.service';
import { CreateKeterlambatanDto, UpdateKeterlambatanDto } from './dto/keterlambatan.dto';
export declare class KeterlambatanController {
    private readonly keterlambatanService;
    constructor(keterlambatanService: KeterlambatanService);
    syncFromWalas(startDate: string, endDate: string): Promise<any>;
    findAll(startDate?: string, endDate?: string, studentId?: number, className?: string, status?: 'recorded' | 'verified' | 'appealed' | 'resolved', page?: number, limit?: number): Promise<any>;
    findByStudent(studentId: number, startDate?: string, endDate?: string, status?: 'recorded' | 'verified' | 'appealed' | 'resolved', page?: number, limit?: number): Promise<any>;
    findByClass(className: string, startDate?: string, endDate?: string, status?: 'recorded' | 'verified' | 'appealed' | 'resolved', page?: number, limit?: number): Promise<any>;
    getStatistics(startDate?: string, endDate?: string, studentId?: number, className?: string): Promise<any>;
    findOne(id: number): Promise<import("./entities/keterlambatan.entity").Keterlambatan>;
    create(createKeterlambatanDto: CreateKeterlambatanDto): Promise<import("./entities/keterlambatan.entity").Keterlambatan>;
    update(id: number, updateKeterlambatanDto: UpdateKeterlambatanDto): Promise<import("./entities/keterlambatan.entity").Keterlambatan>;
    delete(id: number): Promise<void>;
}
