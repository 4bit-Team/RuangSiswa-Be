import { User } from '../../users/entities/user.entity';
import { CounselingCategory } from '../../counseling-category/entities/counseling-category.entity';
export declare class GroupReservasi {
    id: number;
    groupName: string;
    creatorId: number;
    creator: User;
    students: User[];
    counselorId: number;
    counselor: User;
    preferredDate: Date;
    preferredTime: string;
    type: 'chat' | 'tatap-muka';
    topic: CounselingCategory;
    topicId: number;
    notes: string;
    status: 'pending' | 'approved' | 'rejected' | 'in_counseling' | 'completed' | 'cancelled';
    conversationId: number;
    rejectionReason: string;
    room: string;
    qrCode: string;
    attendanceConfirmed: boolean;
    completedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
