import { IsString, IsNumber, IsDate, IsOptional, IsEnum, IsArray } from 'class-validator';

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

  @IsEnum(['chat', 'tatap-muka'])
  type: 'chat' | 'tatap-muka';

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
  @IsEnum(['approved', 'rejected', 'in_counseling', 'completed', 'cancelled'])
  status: 'approved' | 'rejected' | 'in_counseling' | 'completed' | 'cancelled';

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
