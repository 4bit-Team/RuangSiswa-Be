import { User } from '../../users/entities/user.entity';
import { Message } from './message.entity';
export declare class Conversation {
    id: number;
    senderId: number;
    receiverId: number;
    subject: string;
    lastMessageId: number;
    lastMessageAt: Date;
    isActive: boolean;
    status: 'active' | 'in_counseling' | 'completed';
    createdAt: Date;
    updatedAt: Date;
    senderIdMin: number;
    senderIdMax: number;
    sender: User;
    receiver: User;
    messages: Message[];
}
