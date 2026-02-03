import { CallType } from '../entities/call.entity';
export declare class CreateCallDto {
    receiverId: number;
    conversationId: number;
    callType: CallType;
    offer?: string;
}
export declare class CallOfferDto {
    callId: number;
    offer: string;
    iceCandidates?: string;
}
export declare class CallAnswerDto {
    callId: number;
    answer: string;
    iceCandidates?: string;
}
export declare class CallRejectDto {
    callId: number;
    reason?: string;
}
export declare class CallEndDto {
    callId: number;
    duration?: number;
}
export declare class IceCandidateDto {
    callId: number;
    candidate: string;
    sdpMLineIndex?: string;
    sdpMid?: string;
}
