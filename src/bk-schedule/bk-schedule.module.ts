import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BkScheduleService } from './bk-schedule.service';
import { BkScheduleController } from './bk-schedule.controller';
import { BkSchedule } from './entities/bk-schedule.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BkSchedule])],
  providers: [BkScheduleService],
  controllers: [BkScheduleController],
  exports: [BkScheduleService],
})
export class BkScheduleModule {}
