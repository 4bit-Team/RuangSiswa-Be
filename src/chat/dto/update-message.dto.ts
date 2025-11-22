import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UpdateMessageDto {
  @IsString()
  @IsOptional()
  content?: string;
}

export class MarkAsReadDto {
  @IsNumber()
  messageId: number;
}
