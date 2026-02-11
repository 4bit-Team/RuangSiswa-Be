import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PembinaanWakaService } from './pembinaan-waka.service';
import { PembinaanWakaController } from './pembinaan-waka.controller';
import { PembinaanWaka } from './entities/pembinaan-waka.entity';
import { Reservasi } from '../../reservasi/entities/reservasi.entity';
import { NotificationModule } from '../../notifications/notification.module';

@Module({
  imports: [TypeOrmModule.forFeature([PembinaanWaka, Reservasi]), NotificationModule],
  controllers: [PembinaanWakaController],
  providers: [PembinaanWakaService],
  exports: [PembinaanWakaService],
})
export class PembinaanWakaModule {}
