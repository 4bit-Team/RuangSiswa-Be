import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservasiService } from './reservasi.service';
import { ReservasiController } from './reservasi.controller';
import { Reservasi } from './entities/reservasi.entity';
import { Feedback } from './entities/feedback.entity';
import { CounselingCategory } from '../counseling-category/entities/counseling-category.entity';
import { ChatModule } from '../chat/chat.module';
import { UsersModule } from '../users/users.module';
import { FeedbackService } from './feedback.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservasi, Feedback, CounselingCategory]),
    ChatModule,
    UsersModule,
  ],
  providers: [ReservasiService, FeedbackService],
  controllers: [ReservasiController],
  exports: [ReservasiService, FeedbackService],
})
export class ReservasiModule {}
