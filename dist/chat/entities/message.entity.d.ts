import { User } from '../../users/entities/user.entity';
import { Conversation } from './conversation.entity';
import { MessageReadStatus } from './message-read-status.entity';
export declare enum MessageType {
    TEXT = "text",
    IMAGE = "image",
    FILE = "file",
    VOICE = "voice",
    SYSTEM = "system"
}
export declare class Message {
    id: number;
    conversationId: number;
    senderId: number;
    receiverId: number;
    content: string;
    messageType: MessageType;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    duration: number;
    isEdited: boolean;
    editedAt: Date;
    isDeleted: boolean;
    deletedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    conversation: Conversation;
    sender: User;
    receiver: User;
    readStatuses: MessageReadStatus[];
}
