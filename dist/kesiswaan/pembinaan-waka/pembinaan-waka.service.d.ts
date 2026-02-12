import { Repository } from 'typeorm';
import { PembinaanWaka } from './entities/pembinaan-waka.entity';
import { Reservasi } from '../../reservasi/entities/reservasi.entity';
import { CreatePembinaanWakaDto, DecidePembinaanWakaDto, AcknowledgePembinaanWakaDto, AppealPembinaanWakaDto, UpdatePembinaanWakaDto } from './dto/create-pembinaan-waka.dto';
import { NotificationService } from '../../notifications/notification.service';
export declare class PembinaanWakaService {
    private pembinaanWakaRepository;
    private reservasiRepository;
    private notificationService?;
    private readonly logger;
    constructor(pembinaanWakaRepository: Repository<PembinaanWaka>, reservasiRepository: Repository<Reservasi>, notificationService?: NotificationService | undefined);
    create(dto: CreatePembinaanWakaDto): Promise<PembinaanWaka>;
    findAll(): Promise<PembinaanWaka[]>;
    getPendingForWaka(waka_id: number): Promise<PembinaanWaka[]>;
    findOne(id: number): Promise<PembinaanWaka>;
    makeDecision(id: number, dto: DecidePembinaanWakaDto, waka_id: number): Promise<PembinaanWaka>;
    studentAcknowledge(id: number, dto: AcknowledgePembinaanWakaDto, student_id: number): Promise<PembinaanWaka>;
    markAsExecuted(id: number, waka_id: number, execution_notes?: string): Promise<PembinaanWaka>;
    submitAppeal(id: number, dto: AppealPembinaanWakaDto, student_id: number): Promise<PembinaanWaka>;
    decideOnAppeal(id: number, appealDecision: 'sp3' | 'do', waka_id: number): Promise<PembinaanWaka>;
    getWakaStatistics(waka_id: number): Promise<{
        pending: number;
        inReview: number;
        decided: number;
        executed: number;
        appealed: number;
        sp3Total: number;
        doTotal: number;
    }>;
    update(id: number, dto: UpdatePembinaanWakaDto): Promise<PembinaanWaka>;
}
