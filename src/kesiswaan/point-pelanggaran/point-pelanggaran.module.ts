import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointPelanggaranService } from './point-pelanggaran.service';
import { PointPelanggaranController } from './point-pelanggaran.controller';
import { PointPelanggaran } from './entities/point-pelanggaran.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PointPelanggaran])],
  controllers: [PointPelanggaranController],
  providers: [PointPelanggaranService],
  exports: [PointPelanggaranService],
})
export class PointPelanggaranModule {}
