import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { Reservasi } from '../reservasi/entities/reservasi.entity';
import { Feedback } from '../reservasi/entities/feedback.entity';
import { LaporanBk } from '../laporan-bk/entities/laporan-bk.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reservasi, Feedback, LaporanBk, User])],
  controllers: [StatisticsController],
  providers: [StatisticsService],
  exports: [StatisticsService],
})
export class StatisticsModule {}
