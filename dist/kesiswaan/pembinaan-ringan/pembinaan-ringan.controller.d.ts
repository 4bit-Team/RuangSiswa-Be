import { PembinaanRinganService } from './pembinaan-ringan.service';
import { CreatePembinaanRinganDto, ApprovePembinaanRinganDto, CompletePembinaanRinganDto, UpdatePembinaanRinganDto } from './dto/create-pembinaan-ringan.dto';
export declare class PembinaanRinganController {
    private readonly pembinaanRinganService;
    private readonly logger;
    constructor(pembinaanRinganService: PembinaanRinganService);
    create(createDto: CreatePembinaanRinganDto): Promise<import("./entities/pembinaan-ringan.entity").PembinaanRingan>;
    findAll(): Promise<import("./entities/pembinaan-ringan.entity").PembinaanRingan[]>;
    findPending(user: any): Promise<import("./entities/pembinaan-ringan.entity").PembinaanRingan[]>;
    findOne(id: number): Promise<import("./entities/pembinaan-ringan.entity").PembinaanRingan>;
    approve(id: number, approveDto: ApprovePembinaanRinganDto): Promise<import("./entities/pembinaan-ringan.entity").PembinaanRingan>;
    complete(id: number, completeDto: CompletePembinaanRinganDto): Promise<import("./entities/pembinaan-ringan.entity").PembinaanRingan>;
    update(id: number, updateDto: UpdatePembinaanRinganDto): Promise<import("./entities/pembinaan-ringan.entity").PembinaanRingan>;
    findByStudentId(studentId: number): Promise<import("./entities/pembinaan-ringan.entity").PembinaanRingan[]>;
    getStatistics(): Promise<any>;
}
