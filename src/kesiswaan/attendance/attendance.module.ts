import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { WalasModule } from '../../walas/walas.module';
import { AttendanceRecord } from './entities/attendance-record.entity';
import { AttendanceSummary } from './entities/attendance-summary.entity';
import { AttendanceAlert } from './entities/attendance-alert.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AttendanceRecord, AttendanceSummary, AttendanceAlert]),
    HttpModule,
    ConfigModule,
    WalasModule,
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService], // Export for use in other modules
})
export class AttendanceModule {}
