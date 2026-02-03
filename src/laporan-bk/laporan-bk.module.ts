import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LaporanBkService } from './laporan-bk.service';
import { LaporanBkController } from './laporan-bk.controller';
import { LaporanBk } from './entities/laporan-bk.entity';
import { LaporanBkExcelService } from './laporan-bk-excel.service';

@Module({
  imports: [TypeOrmModule.forFeature([LaporanBk])],
  controllers: [LaporanBkController],
  providers: [LaporanBkService, LaporanBkExcelService],
})
export class LaporanBkModule {}
