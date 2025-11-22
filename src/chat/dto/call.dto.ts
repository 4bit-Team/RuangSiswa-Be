import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { CallType } from '../entities/call.entity';

export class CreateCallDto {
  @IsNumber()
  receiverId: number;

  @IsNumber()
  conversationId: number;

  @IsEnum(CallType)
  callType: CallType;
}

export class CallOfferDto {
  @IsNumber()
  callId: number;

  @IsString()
  offer: string; // SDP offer

  @IsOptional()
  @IsString()
  iceCandidates?: string; // JSON stringified array
}

export class CallAnswerDto {
  @IsNumber()
  callId: number;

  @IsString()
  answer: string; // SDP answer

  @IsOptional()
  @IsString()
  iceCandidates?: string; // JSON stringified array
}

export class CallRejectDto {
  @IsNumber()
  callId: number;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class CallEndDto {
  @IsNumber()
  callId: number;

  @IsOptional()
  @IsNumber()
  duration?: number; // Dalam detik
}

export class IceCandidateDto {
  @IsNumber()
  callId: number;

  @IsString()
  candidate: string; // JSON stringified ICE candidate

  @IsOptional()
  @IsString()
  sdpMLineIndex?: string;

  @IsOptional()
  @IsString()
  sdpMid?: string;
}
