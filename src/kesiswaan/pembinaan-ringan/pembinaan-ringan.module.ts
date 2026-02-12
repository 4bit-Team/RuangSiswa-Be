import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PembinaanRinganService } from './pembinaan-ringan.service';
import { PembinaanRinganController } from './pembinaan-ringan.controller';
import { PembinaanRingan } from './entities/pembinaan-ringan.entity';
import { Reservasi } from '../../reservasi/entities/reservasi.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PembinaanRingan, Reservasi])],
  providers: [PembinaanRinganService],
  controllers: [PembinaanRinganController],
  exports: [PembinaanRinganService],
})
export class PembinaanRinganModule {}
