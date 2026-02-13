import { KehadiranService } from './kehadiran.service';
import { CreateKehadiranDto, UpdateKehadiranDto } from './dto/kehadiran.dto';
export declare class KehadiranController {
    private readonly kehadiranService;
    constructor(kehadiranService: KehadiranService);
    syncFromWalas(startDate: string, endDate: string): Promise<any>;
    findAll(startDate?: string, endDate?: string, studentId?: number, className?: string, status?: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa', page?: number, limit?: number): Promise<any>;
    findByStudent(studentId: number, startDate?: string, endDate?: string, status?: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa', page?: number, limit?: number): Promise<any>;
    findByClass(className: string, startDate?: string, endDate?: string, status?: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa', page?: number, limit?: number): Promise<any>;
    getStatistics(startDate?: string, endDate?: string, studentId?: number, className?: string): Promise<any>;
    findOne(id: number): Promise<import("./entities/kehadiran.entity").Kehadiran>;
    create(createKehadiranDto: CreateKehadiranDto): Promise<import("./entities/kehadiran.entity").Kehadiran>;
    update(id: number, updateKehadiranDto: UpdateKehadiranDto): Promise<import("./entities/kehadiran.entity").Kehadiran>;
    delete(id: number): Promise<void>;
}
