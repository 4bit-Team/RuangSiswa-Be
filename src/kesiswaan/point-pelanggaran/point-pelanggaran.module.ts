import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointPelanggaranService } from './point-pelanggaran.service';
import { PointPelanggaranController } from './point-pelanggaran.controller';
import { PointPelanggaran } from './entities/point-pelanggaran.entity';
import { PointPelanggaranPdfService } from './services/point-pelanggaran-pdf.service';

@Module({
  imports: [TypeOrmModule.forFeature([PointPelanggaran])],
  controllers: [PointPelanggaranController],
  providers: [PointPelanggaranService, PointPelanggaranPdfService],
  exports: [PointPelanggaranService],
})
export class PointPelanggaranModule {}
