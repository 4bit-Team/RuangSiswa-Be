import { SessionType } from '../enums/session-type.enum';
import { ReservasiStatus } from '../enums/reservasi-status.enum';
export declare class CreateGroupReservasiDto {
    groupName: string;
    creatorId: number;
    studentIds: number[];
    counselorId: number;
    preferredDate: Date;
    preferredTime: string;
    type: SessionType;
    topicId?: number;
    notes?: string;
    room?: string;
}
export declare class UpdateGroupReservasiStatusDto {
    status: ReservasiStatus;
    rejectionReason?: string;
}
