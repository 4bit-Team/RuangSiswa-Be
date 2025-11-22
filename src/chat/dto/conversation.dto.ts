import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class ConversationDto {
  @IsNumber()
  @IsNotEmpty()
  receiverId: number;

  @IsString()
  @IsOptional()
  subject?: string;
}
