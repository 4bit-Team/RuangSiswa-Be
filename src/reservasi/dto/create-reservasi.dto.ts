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
  @IsEnum(['approved', 'rejected', 'in_counseling', 'completed', 'cancelled'])
  status: 'approved' | 'rejected' | 'in_counseling' | 'completed' | 'cancelled';

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
