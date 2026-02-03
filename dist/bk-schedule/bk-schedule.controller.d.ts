import { BkScheduleService } from './bk-schedule.service';
import { CreateBkScheduleDto, UpdateBkScheduleDto } from './dto/create-bk-schedule.dto';
export declare class BkScheduleController {
    private readonly scheduleService;
    constructor(scheduleService: BkScheduleService);
    createOrUpdate(sessionType: string, createDto: CreateBkScheduleDto, req: any): Promise<import("./entities/bk-schedule.entity").BkSchedule>;
    getMySchedules(req: any): Promise<import("./entities/bk-schedule.entity").BkSchedule[]>;
    getMyScheduleByType(sessionType: string, req: any): Promise<import("./entities/bk-schedule.entity").BkSchedule>;
    getAvailableBKs(sessionType: string, date: string, time: string): Promise<{
        date: string;
        time: string;
        sessionType: string;
        availableBKIds: number[];
        count: number;
        bookingStatus: {
            bkId: number;
            fullName: string;
            username: string;
            specialty?: string;
            available: boolean;
            booked: boolean;
        }[];
    }>;
    checkAvailability(bkId: string, sessionType: string, date: string, time: string): Promise<{
        bkId: number;
        date: string;
        time: string;
        sessionType: string;
        isAvailable: boolean;
    }>;
    getScheduleByBkIdAndType(bkId: string, sessionType: string): Promise<import("./entities/bk-schedule.entity").BkSchedule>;
    updateSchedule(sessionType: string, updateDto: UpdateBkScheduleDto, req: any): Promise<import("./entities/bk-schedule.entity").BkSchedule>;
    deleteSchedule(sessionType: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
