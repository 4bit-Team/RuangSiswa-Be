import { LaporanBkService } from './laporan-bk.service';
import { CreateLaporanBkDto, UpdateLaporanBkDto, RecordSessionDto, EscalateToBkDto, CompleteFollowUpDto } from './dto/create-laporan-bk.dto';
export declare class LaporanBkController {
    private readonly laporanBkService;
    constructor(laporanBkService: LaporanBkService);
    create(createDto: CreateLaporanBkDto): Promise<import("./entities/laporan-bk.entity").LaporanBk>;
    findAll(): Promise<import("./entities/laporan-bk.entity").LaporanBk[]>;
    getMyLaporan(req: any): Promise<import("./entities/laporan-bk.entity").LaporanBk[]>;
    getOngoing(): Promise<import("./entities/laporan-bk.entity").LaporanBk[]>;
    getPendingFollowUp(): Promise<import("./entities/laporan-bk.entity").LaporanBk[]>;
    getBkStatistics(req: any): Promise<{
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
    getByReservasiId(reservasiId: string): Promise<import("./entities/laporan-bk.entity").LaporanBk>;
    findOne(id: string): Promise<import("./entities/laporan-bk.entity").LaporanBk>;
    recordSession(id: string, recordSessionDto: RecordSessionDto, req: any): Promise<import("./entities/laporan-bk.entity").LaporanBk>;
    markBehavioralImprovement(id: string, body: {
        improved: boolean;
    }, req: any): Promise<import("./entities/laporan-bk.entity").LaporanBk>;
    notifyParent(id: string, body: {
        notification_content: string;
    }, req: any): Promise<import("./entities/laporan-bk.entity").LaporanBk>;
    completeFollowUp(id: string, completeDto: CompleteFollowUpDto, req: any): Promise<import("./entities/laporan-bk.entity").LaporanBk>;
    escalateToWaka(id: string, escalateDto: EscalateToBkDto, req: any): Promise<import("./entities/laporan-bk.entity").LaporanBk>;
    complete(id: string, body: {
        final_assessment: string;
    }, req: any): Promise<import("./entities/laporan-bk.entity").LaporanBk>;
    update(id: string, updateDto: UpdateLaporanBkDto): Promise<import("./entities/laporan-bk.entity").LaporanBk>;
    archive(id: string): Promise<import("./entities/laporan-bk.entity").LaporanBk>;
}
