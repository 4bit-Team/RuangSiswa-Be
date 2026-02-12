export interface DaySchedule {
    day: string;
    startTime: string;
    endTime: string;
    isActive: boolean;
}
export declare class CreateBkScheduleDto {
    bkId: number;
    sessionType: 'tatap-muka' | 'chat';
    daySchedules: DaySchedule[];
    isActive?: boolean;
}
export declare class UpdateBkScheduleDto {
    sessionType?: 'tatap-muka' | 'chat';
    daySchedules?: DaySchedule[];
    isActive?: boolean;
}
