import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { CallService } from './call.service';
import { CallController } from './call.controller';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { MessageReadStatus } from './entities/message-read-status.entity';
import { Call } from './entities/call.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, Message, MessageReadStatus, Call]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  providers: [ChatService, CallService, ChatGateway],
  controllers: [ChatController, CallController],
  exports: [ChatService, CallService],
})
export class ChatModule {}
