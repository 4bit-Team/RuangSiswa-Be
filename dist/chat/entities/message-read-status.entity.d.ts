import { User } from '../../users/entities/user.entity';
import { Message } from './message.entity';
export declare class MessageReadStatus {
    id: number;
    messageId: number;
    userId: number;
    isDelivered: boolean;
    isRead: boolean;
    deliveredAt: Date;
    readAt: Date;
    createdAt: Date;
    updatedAt: Date;
    message: Message;
    user: User;
}
