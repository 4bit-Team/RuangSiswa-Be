import { User } from '../../users/entities/user.entity';
export type SessionType = 'tatap-muka' | 'chat';
export interface DaySchedule {
    day: string;
    startTime: string;
    endTime: string;
    isActive: boolean;
}
export declare class BkSchedule {
    id: number;
    bkId: number;
    bk: User;
    sessionType: SessionType;
    daySchedules: DaySchedule[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
