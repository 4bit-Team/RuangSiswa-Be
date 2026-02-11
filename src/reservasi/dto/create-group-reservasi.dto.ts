import { IsString, IsNumber, IsDate, IsOptional, IsEnum, IsArray } from 'class-validator';
import { SessionType } from '../enums/session-type.enum';
import { ReservasiStatus } from '../enums/reservasi-status.enum';

export class CreateGroupReservasiDto {
  @IsString()
  groupName: string;

  @IsNumber()
  creatorId: number;

  @IsArray()
  @IsNumber({}, { each: true })
  studentIds: number[]; // Daftar ID siswa dalam grup

  @IsNumber()
  counselorId: number;

  @IsDate()
  preferredDate: Date;

  @IsString()
  preferredTime: string;

  @IsEnum(SessionType)
  type: SessionType;

  @IsOptional()
  @IsNumber()
  topicId?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  room?: string;
}

export class UpdateGroupReservasiStatusDto {
  @IsEnum(ReservasiStatus)
  status: ReservasiStatus;

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
