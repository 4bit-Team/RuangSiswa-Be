import { IsString, IsNumber, IsDate, IsOptional, IsEnum } from 'class-validator';

export class CreateReservasiDto {
  @IsNumber()
  studentId: number;

  @IsNumber()
  counselorId: number;

  @IsDate()
  preferredDate: Date;

  @IsString()
  preferredTime: string;

  @IsEnum(['chat', 'tatap-muka'])
  type: 'chat' | 'tatap-muka';

  @IsOptional()
  @IsString()
  topic?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  room?: string;
}

export class UpdateReservasiStatusDto {
  @IsEnum(['approved', 'rejected', 'completed', 'cancelled'])
  status: 'approved' | 'rejected' | 'completed' | 'cancelled';

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
