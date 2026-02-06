import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { AttendanceRecord } from './entities/attendance-record.entity';
import { AttendanceSummary } from './entities/attendance-summary.entity';
import { AttendanceAlert } from './entities/attendance-alert.entity';
import { WalasApiClient } from '../../walas/walas-api.client';

@Module({
  imports: [
    TypeOrmModule.forFeature([AttendanceRecord, AttendanceSummary, AttendanceAlert]),
    HttpModule,
    ConfigModule,
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService, WalasApiClient],
  exports: [AttendanceService], // Export for use in other modules
})
export class AttendanceModule {}
