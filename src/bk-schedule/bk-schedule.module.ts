import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BkScheduleService } from './bk-schedule.service';
import { BkScheduleController } from './bk-schedule.controller';
import { BkSchedule } from './entities/bk-schedule.entity';
import { Reservasi } from '../reservasi/entities/reservasi.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BkSchedule, Reservasi, User])],
  providers: [BkScheduleService],
  controllers: [BkScheduleController],
  exports: [BkScheduleService],
})
export class BkScheduleModule {}
