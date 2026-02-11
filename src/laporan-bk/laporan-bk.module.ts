import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LaporanBkService } from './laporan-bk.service';
import { LaporanBkController } from './laporan-bk.controller';
import { LaporanBk } from './entities/laporan-bk.entity';
import { Reservasi } from '../reservasi/entities/reservasi.entity';
import { NotificationModule } from '../notifications/notification.module';

@Module({
  imports: [TypeOrmModule.forFeature([LaporanBk, Reservasi]), NotificationModule],
  controllers: [LaporanBkController],
  providers: [LaporanBkService],
  exports: [LaporanBkService],
})
export class LaporanBkModule {}
