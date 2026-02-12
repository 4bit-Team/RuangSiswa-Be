import { Repository } from 'typeorm';
import { PembinaanRingan } from './entities/pembinaan-ringan.entity';
import { CreatePembinaanRinganDto, ApprovePembinaanRinganDto, CompletePembinaanRinganDto, UpdatePembinaanRinganDto } from './dto/create-pembinaan-ringan.dto';
import { Reservasi } from '../../reservasi/entities/reservasi.entity';
export declare class PembinaanRinganService {
    private pembinaanRinganRepo;
    private reservasiRepo;
    private readonly logger;
    constructor(pembinaanRinganRepo: Repository<PembinaanRingan>, reservasiRepo: Repository<Reservasi>);
    create(createDto: CreatePembinaanRinganDto): Promise<PembinaanRingan>;
    findAll(): Promise<PembinaanRingan[]>;
    findPendingForCounselor(counselorId: number): Promise<PembinaanRingan[]>;
    findOne(id: number): Promise<PembinaanRingan>;
    approve(id: number, approveDto: ApprovePembinaanRinganDto): Promise<PembinaanRingan>;
    complete(id: number, completeDto: CompletePembinaanRinganDto): Promise<PembinaanRingan>;
    update(id: number, updateDto: UpdatePembinaanRinganDto): Promise<PembinaanRingan>;
    findByStudentId(studentId: number): Promise<PembinaanRingan[]>;
    getStatistics(): Promise<any>;
}
