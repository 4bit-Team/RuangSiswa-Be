import { IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';

export class CreateFeedbackDto {
  @IsNumber()
  reservasiId: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number; // 1-5 stars

  @IsString()
  @IsOptional()
  comment?: string;
}

export class UpdateFeedbackDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @IsString()
  @IsOptional()
  comment?: string;
}
