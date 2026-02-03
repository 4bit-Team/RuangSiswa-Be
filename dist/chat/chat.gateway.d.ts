import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
interface AuthenticatedSocket extends Socket {
    userId: number;
}
export declare class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    private chatService;
    server: Server;
    private onlineUsers;
    private messageLimiter;
    constructor(jwtService: JwtService, chatService: ChatService);
    private getJwtSecret;
    afterInit(): void;
    handleConnection(client: AuthenticatedSocket): Promise<void>;
    handleDisconnect(client: AuthenticatedSocket): void;
    handleError(client: AuthenticatedSocket, error: any): void;
    handleJoinConversation(client: AuthenticatedSocket, data: {
        conversationId: number;
    }): {
        status: string;
        conversationId: number;
    };
    handleLeaveConversation(client: AuthenticatedSocket, data: {
        conversationId: number;
    }): {
        status: string;
        conversationId: number;
    };
    handleSendMessage(client: AuthenticatedSocket, data: CreateMessageDto): Promise<{
        status: string;
        message: any;
    }>;
    handleUserTyping(client: AuthenticatedSocket, data: {
        conversationId: number;
    }): {
        status: string;
    };
    handleUserStoppedTyping(client: AuthenticatedSocket, data: {
        conversationId: number;
    }): {
        status: string;
    };
    handleMarkAsRead(client: AuthenticatedSocket, data: {
        messageId: number;
        conversationId: number;
    }): Promise<{
        status: string;
        message?: undefined;
    } | {
        status: string;
        message: any;
    }>;
    handleMarkConversationAsRead(client: AuthenticatedSocket, data: {
        conversationId: number;
    }): Promise<{
        status: string;
        message?: undefined;
    } | {
        status: string;
        message: any;
    }>;
    handleDeleteMessage(client: AuthenticatedSocket, data: {
        messageId: number;
        conversationId: number;
    }): Promise<{
        status: string;
        message?: undefined;
    } | {
        status: string;
        message: any;
    }>;
    handleGetOnlineUsers(client: AuthenticatedSocket, data: {
        conversationId: number;
    }): {
        conversationId: number;
        onlineUsers: number[];
        timestamp: Date;
    };
    handleGetUserStatus(client: AuthenticatedSocket, data: {
        userId: number;
    }): {
        userId: number;
        isOnline: boolean;
        timestamp: Date;
    };
    notifyUser(userId: number, event: string, data: any): void;
    notifyConversation(conversationId: number, event: string, data: any): void;
    getOnlineUsersCount(): number;
    isUserOnline(userId: number): boolean;
}
export {};
