import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PembinaanOrtuService } from './pembinaan-ortu.service';
import { PembinaanOrtuController } from './pembinaan-ortu.controller';
import { PembinaanOrtu } from './entities/pembinaan-ortu.entity';
import { Pembinaan } from '../pembinaan/entities/pembinaan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PembinaanOrtu, Pembinaan])],
  providers: [PembinaanOrtuService],
  controllers: [PembinaanOrtuController],
  exports: [PembinaanOrtuService],
})
export class PembinaanOrtuModule {}
