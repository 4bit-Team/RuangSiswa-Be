import { Repository } from 'typeorm';
import { BkSchedule } from './entities/bk-schedule.entity';
import { CreateBkScheduleDto, UpdateBkScheduleDto } from './dto/create-bk-schedule.dto';
import { Reservasi } from '../reservasi/entities/reservasi.entity';
import { User } from '../users/entities/user.entity';
export declare class BkScheduleService {
    private scheduleRepository;
    private reservasiRepository;
    private userRepository;
    constructor(scheduleRepository: Repository<BkSchedule>, reservasiRepository: Repository<Reservasi>, userRepository: Repository<User>);
    createOrUpdate(createDto: CreateBkScheduleDto): Promise<BkSchedule>;
    getSchedulesByBkId(bkId: number): Promise<BkSchedule[]>;
    getScheduleByBkIdAndType(bkId: number, sessionType: 'tatap-muka' | 'chat'): Promise<BkSchedule>;
    getAllActiveSchedules(): Promise<BkSchedule[]>;
    update(bkId: number, sessionType: 'tatap-muka' | 'chat', updateDto: UpdateBkScheduleDto): Promise<BkSchedule>;
    isAvailable(bkId: number, date: Date, time: string, sessionType: 'tatap-muka' | 'chat'): Promise<boolean>;
    getAvailableBKs(date: Date, time: string, sessionType: 'tatap-muka' | 'chat'): Promise<number[]>;
    delete(bkId: number, sessionType: 'tatap-muka' | 'chat'): Promise<boolean>;
    hasBooking(bkId: number, date: Date, time: string): Promise<boolean>;
    getAvailableBKsWithStatus(date: Date, time: string, sessionType: 'tatap-muka' | 'chat'): Promise<{
        bkId: number;
        fullName: string;
        username: string;
        specialty?: string;
        available: boolean;
        booked: boolean;
    }[]>;
}
