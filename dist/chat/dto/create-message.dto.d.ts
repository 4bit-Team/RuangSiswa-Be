import { MessageType } from '../entities/message.entity';
export declare class CreateMessageDto {
    content: string;
    receiverId: number;
    conversationId: number;
    messageType?: MessageType;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
}
