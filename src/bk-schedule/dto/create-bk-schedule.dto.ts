import { IsNumber, IsString, IsArray, IsBoolean, IsOptional, IsEnum, IsObject } from 'class-validator';

export interface DaySchedule {
  day: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export class CreateBkScheduleDto {
  @IsNumber()
  bkId: number;

  @IsEnum(['tatap-muka', 'chat'])
  sessionType: 'tatap-muka' | 'chat'; // Tipe sesi

  @IsArray()
  daySchedules: DaySchedule[]; // Array of day-specific schedules

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateBkScheduleDto {
  @IsOptional()
  @IsEnum(['tatap-muka', 'chat'])
  sessionType?: 'tatap-muka' | 'chat';

  @IsOptional()
  @IsArray()
  daySchedules?: DaySchedule[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
