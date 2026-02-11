import { Repository } from 'typeorm';
import { LaporanBk } from './entities/laporan-bk.entity';
import { Reservasi } from '../reservasi/entities/reservasi.entity';
import { CreateLaporanBkDto, UpdateLaporanBkDto, RecordSessionDto, EscalateToBkDto } from './dto/create-laporan-bk.dto';
import { NotificationService } from '../notifications/notification.service';
export declare class LaporanBkService {
    private laporanBkRepository;
    private reservasiRepository;
    private notificationService?;
    private readonly logger;
    constructor(laporanBkRepository: Repository<LaporanBk>, reservasiRepository: Repository<Reservasi>, notificationService?: NotificationService | undefined);
    create(dto: CreateLaporanBkDto): Promise<LaporanBk>;
    findAll(): Promise<LaporanBk[]>;
    findByBk(bk_id: number): Promise<LaporanBk[]>;
    findOngoing(): Promise<LaporanBk[]>;
    findPendingFollowUp(): Promise<LaporanBk[]>;
    findOne(id: number): Promise<LaporanBk>;
    findByReservasiId(reservasi_id: number): Promise<LaporanBk | null>;
    recordSession(id: number, dto: RecordSessionDto, bk_id: number): Promise<LaporanBk>;
    markBehavioralImprovement(id: number, improved: boolean, bk_id: number): Promise<LaporanBk>;
    notifyParent(id: number, notification_content: string, bk_id: number): Promise<LaporanBk>;
    completeFollowUp(id: number, follow_up_status: string, bk_id: number): Promise<LaporanBk>;
    escalateToWaka(id: number, dto: EscalateToBkDto, bk_id: number): Promise<LaporanBk>;
    complete(id: number, final_assessment: string, bk_id: number): Promise<LaporanBk>;
    update(id: number, dto: UpdateLaporanBkDto): Promise<LaporanBk>;
    archive(id: number): Promise<LaporanBk>;
    getBkStatistics(bk_id: number): Promise<{
        totalLaporan: number;
        ongoing: number;
        completed: number;
        escalated: number;
        needsFollowUp: number;
        totalSessions: number;
        behavioralImprovement: number;
    }>;
    getOverallStatistics(): Promise<{
        totalLaporan: number;
        ongoing: number;
        completed: number;
        escalated: number;
        avgSessionsPerLaporan: number;
        parentNotificationRate: number;
    }>;
}
