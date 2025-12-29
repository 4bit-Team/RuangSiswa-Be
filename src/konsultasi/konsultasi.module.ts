import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KonsultasiController } from './konsultasi.controller';
import { KonsultasiService } from './konsultasi.service';
import { Konsultasi } from './entities/konsultasi.entity';
import { KonsultasiAnswer } from './entities/konsultasi-answer.entity';
import { ToxicFilterModule } from '../toxic-filter/toxic-filter.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Konsultasi, KonsultasiAnswer]),
    ToxicFilterModule,
  ],
  controllers: [KonsultasiController],
  providers: [KonsultasiService],
  exports: [KonsultasiService],
})
export class KonsultasiModule {}
