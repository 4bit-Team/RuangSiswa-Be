import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PembinaanService } from './pembinaan.service';
import { PembinaanController } from './pembinaan.controller';
import { Pembinaan } from './entities/pembinaan.entity';
import { PointPelanggaran } from '../point-pelanggaran/entities/point-pelanggaran.entity';
import { NotificationModule } from '../../notifications/notification.module';
import { WalasModule } from '../../walas/walas.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pembinaan, PointPelanggaran]),
    NotificationModule,
    WalasModule,
  ],
  controllers: [PembinaanController],
  providers: [PembinaanService],
  exports: [PembinaanService],
})
export class PembinaanModule {}
