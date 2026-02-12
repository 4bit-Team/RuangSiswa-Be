import { User } from '../../users/entities/user.entity';
export declare enum CallStatus {
    INITIATED = "initiated",
    RINGING = "ringing",
    ACCEPTED = "accepted",
    ACTIVE = "active",
    ENDED = "ended",
    REJECTED = "rejected",
    MISSED = "missed",
    FAILED = "failed"
}
export declare enum CallType {
    AUDIO = "audio",
    VIDEO = "video"
}
export declare class Call {
    id: number;
    conversationId: number;
    callType: CallType;
    status: CallStatus;
    callerId: number;
    caller: User;
    receiverId: number;
    receiver: User;
    ringingStartedAt: Date;
    acceptedAt: Date;
    endedAt: Date;
    duration: number;
    rejectionReason: string;
    iceCandidates: string[];
    callerOffer: string;
    receiverAnswer: string;
    createdAt: Date;
    updatedAt: Date;
}
