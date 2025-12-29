import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { ChatModule } from '../chat/chat.module';
import { CallModule } from '../chat/call.module';

@Module({
  imports: [ChatModule, CallModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}