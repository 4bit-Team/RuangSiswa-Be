import { Repository } from 'typeorm';
import { Keterlambatan } from './entities/keterlambatan.entity';
import { CreateKeterlambatanDto, UpdateKeterlambatanDto, FilterKeterlambatanDto } from './dto/keterlambatan.dto';
export declare class KeterlambatanService {
    private keterlambatanRepository;
    private readonly walasApiBase;
    constructor(keterlambatanRepository: Repository<Keterlambatan>);
    syncFromWalas(startDate: string, endDate: string): Promise<any>;
    findAll(filterDto: FilterKeterlambatanDto): Promise<any>;
    findOne(id: number): Promise<Keterlambatan>;
    findByStudent(studentId: number, filterDto?: FilterKeterlambatanDto): Promise<any>;
    findByClass(className: string, filterDto?: FilterKeterlambatanDto): Promise<any>;
    create(createKeterlambatanDto: CreateKeterlambatanDto): Promise<Keterlambatan>;
    update(id: number, updateKeterlambatanDto: UpdateKeterlambatanDto): Promise<Keterlambatan>;
    delete(id: number): Promise<void>;
    getStatistics(filterDto: FilterKeterlambatanDto): Promise<any>;
}
