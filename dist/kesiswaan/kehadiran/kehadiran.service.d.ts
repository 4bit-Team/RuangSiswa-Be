import { Repository } from 'typeorm';
import { Kehadiran } from './entities/kehadiran.entity';
import { CreateKehadiranDto, UpdateKehadiranDto, FilterKehadiranDto } from './dto/kehadiran.dto';
export declare class KehadiranService {
    private kehadiranRepository;
    private readonly walasApiBase;
    constructor(kehadiranRepository: Repository<Kehadiran>);
    syncFromWalas(startDate: string, endDate: string): Promise<any>;
    private mapStatusFromWalas;
    findAll(filterDto: FilterKehadiranDto): Promise<any>;
    findOne(id: number): Promise<Kehadiran>;
    findByStudent(studentId: number, filterDto?: FilterKehadiranDto): Promise<any>;
    findByClass(className: string, filterDto?: FilterKehadiranDto): Promise<any>;
    create(createKehadiranDto: CreateKehadiranDto): Promise<Kehadiran>;
    update(id: number, updateKehadiranDto: UpdateKehadiranDto): Promise<Kehadiran>;
    delete(id: number): Promise<void>;
    getStatistics(filterDto: FilterKehadiranDto): Promise<any>;
}
