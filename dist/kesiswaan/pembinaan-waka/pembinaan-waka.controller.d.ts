import { PembinaanWakaService } from './pembinaan-waka.service';
import { CreatePembinaanWakaDto, DecidePembinaanWakaDto, AcknowledgePembinaanWakaDto, AppealPembinaanWakaDto, UpdatePembinaanWakaDto } from './dto/create-pembinaan-waka.dto';
export declare class PembinaanWakaController {
    private readonly pembinaanWakaService;
    constructor(pembinaanWakaService: PembinaanWakaService);
    create(createDto: CreatePembinaanWakaDto): Promise<import("./entities/pembinaan-waka.entity").PembinaanWaka>;
    findAll(): Promise<import("./entities/pembinaan-waka.entity").PembinaanWaka[]>;
    getPendingForWaka(req: any): Promise<import("./entities/pembinaan-waka.entity").PembinaanWaka[]>;
    getStatistics(req: any): Promise<{
        pending: number;
        inReview: number;
        decided: number;
        executed: number;
        appealed: number;
        sp3Total: number;
        doTotal: number;
    }>;
    findOne(id: string): Promise<import("./entities/pembinaan-waka.entity").PembinaanWaka>;
    makeDecision(id: string, decideDto: DecidePembinaanWakaDto, req: any): Promise<import("./entities/pembinaan-waka.entity").PembinaanWaka>;
    acknowledgeDecision(id: string, acknowledgeDto: AcknowledgePembinaanWakaDto, req: any): Promise<import("./entities/pembinaan-waka.entity").PembinaanWaka>;
    executeDecision(id: string, body: {
        execution_notes?: string;
    }, req: any): Promise<import("./entities/pembinaan-waka.entity").PembinaanWaka>;
    submitAppeal(id: string, appealDto: AppealPembinaanWakaDto, req: any): Promise<import("./entities/pembinaan-waka.entity").PembinaanWaka>;
    decideOnAppeal(id: string, body: {
        appeal_decision: 'sp3' | 'do';
    }, req: any): Promise<import("./entities/pembinaan-waka.entity").PembinaanWaka>;
    update(id: string, updateDto: UpdatePembinaanWakaDto): Promise<import("./entities/pembinaan-waka.entity").PembinaanWaka>;
}
