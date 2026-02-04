import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservasiService } from './reservasi.service';
import { ReservasiController } from './reservasi.controller';
import { GroupReservasiService } from './group-reservasi.service';
import { GroupReservasiController } from './group-reservasi.controller';
import { Reservasi } from './entities/reservasi.entity';
import { GroupReservasi } from './entities/group-reservasi.entity';
import { Feedback } from './entities/feedback.entity';
import { CounselingCategory } from '../counseling-category/entities/counseling-category.entity';
import { ChatModule } from '../chat/chat.module';
import { UsersModule } from '../users/users.module';
import { FeedbackService } from './feedback.service';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservasi, GroupReservasi, Feedback, CounselingCategory, User]),
    ChatModule,
    UsersModule,
  ],
  providers: [ReservasiService, GroupReservasiService, FeedbackService],
  controllers: [ReservasiController, GroupReservasiController],
  exports: [ReservasiService, GroupReservasiService, FeedbackService],
})
export class ReservasiModule {}
