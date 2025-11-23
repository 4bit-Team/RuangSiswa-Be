import { IsNumber, IsString, IsArray, IsBoolean, IsOptional, IsEnum } from 'class-validator';

export class CreateBkScheduleDto {
  @IsNumber()
  bkId: number;

  @IsEnum(['tatap-muka', 'chat'])
  sessionType: 'tatap-muka' | 'chat'; // Tipe sesi

  @IsString()
  startTime: string; // HH:MM format

  @IsString()
  endTime: string; // HH:MM format

  @IsArray()
  availableDays: string[]; // ['Monday', 'Tuesday', etc]

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateBkScheduleDto {
  @IsOptional()
  @IsEnum(['tatap-muka', 'chat'])
  sessionType?: 'tatap-muka' | 'chat';

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsArray()
  availableDays?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
