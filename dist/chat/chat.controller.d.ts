import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { CreateMessageDto } from './dto/create-message.dto';
import { ConversationDto } from './dto/conversation.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
export declare class ChatController {
    private readonly chatService;
    private readonly chatGateway;
    constructor(chatService: ChatService, chatGateway: ChatGateway);
    getUserConversations(req: any, skip?: number, take?: number): Promise<{
        lastMessage: import("./entities/message.entity").Message | null;
        unreadCount: number;
        id: number;
        senderId: number;
        receiverId: number;
        subject: string;
        lastMessageId: number;
        lastMessageAt: Date;
        isActive: boolean;
        status: "active" | "in_counseling" | "completed";
        createdAt: Date;
        updatedAt: Date;
        senderIdMin: number;
        senderIdMax: number;
        sender: import("../users/entities/user.entity").User;
        receiver: import("../users/entities/user.entity").User;
        messages: import("./entities/message.entity").Message[];
    }[]>;
    createConversation(req: any, dto: ConversationDto): Promise<import("./entities/conversation.entity").Conversation>;
    getConversation(req: any, conversationId: number, limit?: number): Promise<{
        conversation: import("./entities/conversation.entity").Conversation;
        messages: import("./entities/message.entity").Message[];
    }>;
    deleteConversation(req: any, conversationId: number): Promise<void>;
    sendMessage(req: any, dto: CreateMessageDto): Promise<import("./entities/message.entity").Message>;
    updateMessage(req: any, messageId: number, dto: UpdateMessageDto): Promise<import("./entities/message.entity").Message>;
    deleteMessage(req: any, messageId: number): Promise<void>;
    markAsRead(req: any, messageId: number): Promise<import("./entities/message-read-status.entity").MessageReadStatus>;
    markConversationAsRead(req: any, conversationId: number): Promise<{
        message: string;
    }>;
    getUnreadCount(req: any): Promise<{
        unreadCount: number;
    }>;
    getUnreadByConversation(req: any): Promise<any[]>;
    getMessageCount(): Promise<{
        count: number;
    }>;
    searchMessages(req: any, conversationId: number, query: string, limit?: number): Promise<import("./entities/message.entity").Message[]>;
    sendVoiceMessage(req: any, file: Express.Multer.File, body: any): Promise<import("./entities/message.entity").Message>;
}
